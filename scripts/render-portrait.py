import bpy,sys,json,pathlib
from mathutils import Vector
out=pathlib.Path(sys.argv[sys.argv.index('--')+1]);landmarks=json.loads(pathlib.Path(sys.argv[sys.argv.index('--')+2]).read_text());s=bpy.context.scene
if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
for o in s.objects:
 if o.type=='MESH':
  keep=o.visible_get() and any(n in o.name for n in ['Head','Hair','Hat','Glasses'])
  # The source rig drives render visibility; override it only in this unsaved render session.
  o.driver_remove('hide_render')
  o.hide_render=not keep
cam=bpy.data.objects.new('PORTRAIT_CAMERA',bpy.data.cameras.new('PORTRAIT_CAMERA'));s.collection.objects.link(cam);s.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=.52
p=landmarks['rostro'];t=Vector((p[0],-p[2],p[1]+.025));cam.location=t+Vector((0,-5,0));cam.rotation_euler=(t-cam.location).to_track_quat('-Z','Y').to_euler()
s.render.engine='BLENDER_EEVEE';s.render.resolution_x=768;s.render.resolution_y=768;s.render.resolution_percentage=100;s.render.film_transparent=True;s.view_settings.view_transform='Standard';s.view_settings.look='None';s.view_settings.exposure=0;s.view_settings.gamma=1;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.filepath=str(out);bpy.ops.render.render(write_still=True)
