"""Equivalent cameras for every emotion, including true anatomical hand centers."""
import bpy,sys,pathlib,json,math
from mathutils import Vector
out=pathlib.Path(sys.argv[sys.argv.index('--')+1]);out.mkdir(parents=True,exist_ok=True)
landmarks=json.loads(pathlib.Path(sys.argv[sys.argv.index('--')+2]).read_text())
s=bpy.context.scene
if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
visible={o.name for o in s.objects if o.type=='MESH' and o.visible_get()}
for o in s.objects:
 if o.type=='MESH':o.hide_render=o.name not in visible
cam=bpy.data.objects.new('REFERENCE_CAMERA',bpy.data.cameras.new('REFERENCE_CAMERA'));s.collection.objects.link(cam);s.camera=cam;cam.data.type='ORTHO'
s.render.engine='BLENDER_EEVEE';s.render.resolution_percentage=100;s.render.film_transparent=True;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.view_settings.view_transform='Standard';s.view_settings.look='None';s.view_settings.exposure=0;s.view_settings.gamma=1
profiles=[{'name':n,'angle':a,'target':[0,.95,0],'height':2.1,'width':768,'pixels':1024} for n,a in [('front',0),('side',math.pi/2),('back',math.pi),('three-quarter',-math.pi/4)]]
for name,key,height in [('face','rostro',.48),('hand-left','manoL',.36),('hand-right','manoR',.36),('torso','torso',.95)]:
 profiles.append({'name':name,'angle':-math.pi/4 if 'ENOJO' in bpy.data.filepath and key=='manoL' else 0,'target':landmarks[key],'height':height,'width':768,'pixels':768})
profiles.append({'name':'legs','angle':0,'target':[0,.49,0],'height':1.15,'width':768,'pixels':768})
(out/'cameras.json').write_text(json.dumps(profiles,indent=2))
for p in profiles:
 t=Vector((p['target'][0],-p['target'][2],p['target'][1]));cam.location=t+Vector((math.sin(p['angle'])*5,-math.cos(p['angle'])*5,0));cam.rotation_euler=(t-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=p['height'];s.render.resolution_x=p['width'];s.render.resolution_y=p['pixels'];s.render.filepath=str(out/(p['name']+'.png'));bpy.ops.render.render(write_still=True)
print('REFERENCE_COMPLETE',flush=True)
