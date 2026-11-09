"""Read-only source audit and neutral front reference; run with --disable-autoexec."""
import bpy, json, sys, pathlib, math
from mathutils import Vector
out=pathlib.Path(sys.argv[sys.argv.index('--')+1]);out.mkdir(parents=True,exist_ok=True)
s=bpy.context.scene
if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
dg=bpy.context.evaluated_depsgraph_get()
meshes=[o for o in s.objects if o.type=='MESH' and o.visible_get()]
points=[o.matrix_world@Vector(c) for o in meshes for c in o.evaluated_get(dg).bound_box]
lo=[min(p[i] for p in points) for i in range(3)];hi=[max(p[i] for p in points) for i in range(3)]
rig=max((o for o in s.objects if o.type=='ARMATURE'),key=lambda o:len(o.data.bones))
bones={}
for n in ['DEF-hand.L','DEF-hand.R','hand_ik.L','hand_ik.R','head','DEF-spine.006','DEF-foot.L','DEF-foot.R','DEF-thigh.L','DEF-thigh.R','chest']:
 if n in rig.pose.bones:
  b=rig.pose.bones[n];p=rig.matrix_world@((b.head+b.tail)/2);bones[n]=[p.x,p.z,-p.y]
audit={'source':bpy.data.filepath,'meshes':[{'name':o.name,'vertices':len(o.evaluated_get(dg).data.vertices),'materials':[m.name for m in o.data.materials if m]} for o in meshes],'bounds':[lo,hi],'landmarks':bones,'images':[{'name':i.name,'size':list(i.size),'packed':bool(i.packed_file),'filepath':i.filepath} for i in bpy.data.images if i.type=='IMAGE'],'groups':[g.name for g in bpy.data.node_groups],'lights':[{'name':o.name,'type':o.data.type,'energy':o.data.energy} for o in s.objects if o.type=='LIGHT'],'view':{'transform':s.view_settings.view_transform,'look':s.view_settings.look,'exposure':s.view_settings.exposure,'gamma':s.view_settings.gamma}}
(out/'audit.json').write_text(json.dumps(audit,indent=2),encoding='utf8')
for o in s.objects:
 if o.type=='MESH':o.hide_render=o not in meshes
cam=bpy.data.objects.new('AUDIT_CAMERA',bpy.data.cameras.new('AUDIT_CAMERA'));s.collection.objects.link(cam)
center=Vector(((lo[0]+hi[0])/2,0,(lo[2]+hi[2])/2));cam.location=center+Vector((0,-5,0));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=max((hi[2]-lo[2])*1.12,(hi[0]-lo[0])*1.12/.75);s.camera=cam
s.render.engine='BLENDER_EEVEE';s.render.resolution_x=600;s.render.resolution_y=800;s.render.resolution_percentage=100;s.render.film_transparent=True;s.view_settings.view_transform='Standard';s.view_settings.look='None';s.view_settings.exposure=0;s.view_settings.gamma=1;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.filepath=str(out/'source-front.png');bpy.ops.render.render(write_still=True)
