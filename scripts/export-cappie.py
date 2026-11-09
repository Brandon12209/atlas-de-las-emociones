"""Freeze the evaluated pose, preserve original textures/normals and bake Eevee NPR.
Run in a protected Blender copy. Original datablocks are never saved over the source.
"""
import bpy,sys,pathlib,json,math
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:]
OUT=pathlib.Path(args[0]); OUT.mkdir(parents=True,exist_ok=True)
S=bpy.context.scene
if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
dg=bpy.context.evaluated_depsgraph_get()
sources=[o for o in S.objects if o.type=='MESH' and o.visible_get()]
manifest={'source':pathlib.Path(bpy.data.filepath).name,'objects':[],'method':'Eevee UV radiance bake; original evaluated geometry; separate original outline shells'}
rig=max((o for o in S.objects if o.type=='ARMATURE'),key=lambda o:len(o.pose.bones))
landmarks={}
for part,bone in [('manoL','DEF-hand.L'),('manoR','DEF-hand.R'),('torso','chest')]:
    b=rig.pose.bones.get(bone)
    if b:
        p=rig.matrix_world@((b.head+b.tail)/2);landmarks[part]=[p.x,p.z,-p.y]
head=next(o for o in sources if 'Head' in o.name)
hp=[head.matrix_world@Vector(c) for c in head.evaluated_get(dg).bound_box]
hc=Vector([(min(p[i] for p in hp)+max(p[i] for p in hp))/2 for i in range(3)])
landmarks['rostro']=[hc.x,hc.z,-hc.y]
manifest['landmarks']=landmarks
export=[]
for original in sources:
    mesh=bpy.data.meshes.new_from_object(original.evaluated_get(dg),preserve_all_data_layers=True,depsgraph=dg)
    ob=bpy.data.objects.new(original.name+'_WEB',mesh); S.collection.objects.link(ob);ob.matrix_world=original.matrix_world.copy()
    export.append(ob)
    manifest['objects'].append({'name':original.name,'vertices':len(mesh.vertices),'polygons':len(mesh.polygons),'materials':[m.name for m in mesh.materials]})
    ob.hide_render=True
# Work only with evaluated duplicates; keep their geometry and original UV data.
for ob in export:
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
    ob.data.uv_layers.active.name='OriginalUV'
    ob.data.uv_layers.new(name='BakeUV');ob.data.uv_layers.active_index=1
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.008);bpy.ops.object.mode_set(mode='OBJECT')
    mesh=ob.data
    normals=[ob.matrix_world.to_3x3()@n.vector for n in mesh.corner_normals]
    verts=[];faces=[];uvs=[];ns=[];mats=[]
    for poly in mesh.polygons:
        mat=mesh.materials[poly.material_index]
        if 'Outline' in mat.name:continue
        ids=[]
        for li in poly.loop_indices:
            uv=mesh.uv_layers['BakeUV'].data[li].uv
            ids.append(len(verts));verts.append((uv.x,uv.y,0));uvs.append(tuple(mesh.uv_layers['OriginalUV'].data[li].uv));ns.append(normals[li])
        faces.append(ids);mats.append(poly.material_index)
    flat=bpy.data.meshes.new('UV Bake');flat.from_pydata(verts,[],faces);flat.update()
    uv=flat.uv_layers.new(name='OriginalUV')
    attr=flat.attributes.new('PGI_NORMAL','FLOAT_VECTOR','POINT')
    for i,n in enumerate(ns):attr.data[i].vector=n
    for l in flat.loops:uv.data[l.index].uv=uvs[l.vertex_index]
    for mat in mesh.materials:
        copy=mat.copy();copy.name=mat.name+'_BAKE'
        if copy.use_nodes:
            for n in copy.node_tree.nodes:
                if n.type=='TEX_IMAGE':
                    node=copy.node_tree.nodes.new('ShaderNodeUVMap');node.uv_map='OriginalUV';copy.node_tree.links.new(node.outputs['UV'],n.inputs['Vector'])
                if n.type=='GROUP' and n.node_tree.name=='MITA Shader':
                    group=n.node_tree.copy();n.node_tree=group
                    normal=group.nodes.new('ShaderNodeAttribute');normal.attribute_name='PGI_NORMAL'
                    for l in list(group.links):
                        if l.from_node.type=='NEW_GEOMETRY' and l.from_socket.name=='Normal':group.links.new(normal.outputs['Vector'],l.to_socket)
        flat.materials.append(copy)
    for p,mi in zip(flat.polygons,mats):p.material_index=mi
    BS=bpy.data.scenes.new('PGI_UV_BAKE');BS.render.engine='BLENDER_EEVEE';BS.world=S.world
    BO=bpy.data.objects.new('UV_SURFACE',flat);BS.collection.objects.link(BO)
    for l in S.objects:
        if l.type=='LIGHT':
            new=l.copy();new.data=l.data.copy();new.data.use_shadow=False;BS.collection.objects.link(new)
    cam=bpy.data.objects.new('UV_CAMERA',bpy.data.cameras.new('UV_CAMERA'));BS.collection.objects.link(cam);cam.location=(.5,.5,3);cam.data.type='ORTHO';cam.data.ortho_scale=1;BS.camera=cam
    BS.render.resolution_x=2048;BS.render.resolution_y=2048;BS.render.resolution_percentage=100;BS.render.film_transparent=True
    BS.view_settings.view_transform='Standard';BS.view_settings.look='None';BS.view_settings.exposure=0;BS.view_settings.gamma=1
    BS.render.image_settings.file_format='PNG';BS.render.image_settings.color_mode='RGBA';path=OUT/(ob.name+'.png');BS.render.filepath=str(path)
    bpy.ops.render.render(write_still=True,scene=BS.name)
    print('BAKED',ob.name,flush=True)
    image=bpy.data.images.load(str(path));image.pack()
    mat=bpy.data.materials.new(ob.name+'_RADIANCE');mat.use_nodes=True;nt=mat.node_tree;nt.nodes.clear()
    tex=nt.nodes.new('ShaderNodeTexImage');tex.image=image;uvnode=nt.nodes.new('ShaderNodeUVMap');uvnode.uv_map='BakeUV';nt.links.new(uvnode.outputs['UV'],tex.inputs['Vector'])
    emission=nt.nodes.new('ShaderNodeEmission');nt.links.new(tex.outputs['Color'],emission.inputs['Color']);out=nt.nodes.new('ShaderNodeOutputMaterial');nt.links.new(emission.outputs[0],out.inputs['Surface'])
    outline=bpy.data.materials.new(ob.name+'_OUTLINE');outline.use_nodes=True;on=outline.node_tree;on.nodes.clear();e=on.nodes.new('ShaderNodeEmission');e.inputs['Color'].default_value=(.025191,0,.042308,1);o=on.nodes.new('ShaderNodeOutputMaterial');on.links.new(e.outputs[0],o.inputs['Surface']);outline.use_backface_culling=True
    polytypes=[int('Outline' in mesh.materials[p.material_index].name) for p in mesh.polygons]
    mesh.materials.clear();mesh.materials.append(mat);mesh.materials.append(outline)
    for p,k in zip(mesh.polygons,polytypes):p.material_index=k
    mesh.uv_layers['BakeUV'].active_render=True
    ob.hide_render=False
    bpy.data.scenes.remove(BS)
    print('PREPARED',ob.name,flush=True)
bpy.ops.object.select_all(action='DESELECT')
for ob in export:ob.select_set(True)
bpy.context.view_layer.objects.active=export[0]
bpy.ops.export_scene.gltf(filepath=str(OUT/'cappie-radiance.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_skins=False,export_morph=False,export_materials='EXPORT',export_image_format='AUTO')
(OUT/'export-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
print('EXPORT_DONE',flush=True)
