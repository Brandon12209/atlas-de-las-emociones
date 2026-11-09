"""Matched orthographic cameras for source-Eevee/browser comparisons."""
import bpy,sys,pathlib,math,json
from mathutils import Vector
OUT=pathlib.Path(sys.argv[sys.argv.index('--')+1]);OUT.mkdir(parents=True,exist_ok=True);S=bpy.context.scene
visible={o.name for o in S.objects if o.type=='MESH' and o.visible_get()}
for o in S.objects:
 if o.type=='MESH':o.hide_render=o.name not in visible
cam=bpy.data.objects.new('PGI_COMPARISON',bpy.data.cameras.new('PGI_COMPARISON'));S.collection.objects.link(cam);S.camera=cam;cam.data.type='ORTHO'
S.render.engine='BLENDER_EEVEE';S.render.resolution_percentage=100;S.render.film_transparent=True;S.render.image_settings.file_format='PNG';S.render.image_settings.color_mode='RGBA'
S.view_settings.view_transform='Standard';S.view_settings.look='None';S.view_settings.exposure=0;S.view_settings.gamma=1
profiles=[{'name':n,'angle':a,'target':[0,.95,0],'height':2.1,'width':768,'pixels':1024} for n,a in [('front',0),('side',math.pi/2),('back',math.pi),('three-quarter',-math.pi/4)]]
profiles.append({'name':'face','angle':0,'target':[0,1.59,.02],'height':.46,'width':768,'pixels':768})
dg=bpy.context.evaluated_depsgraph_get();ob=bpy.data.objects['Mita_Cappie_Gloves'];mesh=ob.evaluated_get(dg).to_mesh()
for s,sign in [('left',1),('right',-1)]:
 points=[ob.matrix_world@v.co for v in mesh.vertices if v.co.x*sign>0]
 lo=Vector([min(p[i] for p in points) for i in range(3)]);hi=Vector([max(p[i] for p in points) for i in range(3)]);c=(lo+hi)/2
 profiles.append({'name':'hand-'+s,'angle':0,'target':[c.x,c.z,-c.y],'height':.36,'width':768,'pixels':768})
ob.evaluated_get(dg).to_mesh_clear()
(OUT/'cameras.json').write_text(json.dumps(profiles,indent=2))
for p in profiles:
 t=Vector((p['target'][0],-p['target'][2],p['target'][1]));cam.location=t+Vector((math.sin(p['angle'])*5,-math.cos(p['angle'])*5,0));cam.rotation_euler=(t-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=p['height']
 S.render.resolution_x=p['width'];S.render.resolution_y=p['pixels'];S.render.filepath=str(OUT/(p['name']+'.png'));bpy.ops.render.render(write_still=True)
cam.location=(0,-5,.95);cam.rotation_euler=(Vector((0,0,.95))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=2.1
S.render.resolution_x=1536;S.render.resolution_y=2048;S.render.filepath=str(OUT/'cover-hires.png');bpy.ops.render.render(write_still=True)
print('REFERENCE_SET_COMPLETE',flush=True)
