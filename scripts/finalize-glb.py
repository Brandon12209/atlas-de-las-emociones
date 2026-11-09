"""Pad UV islands without altering covered texels and emit portable unlit glTF."""
import sys,json,struct,pathlib,io,hashlib
import numpy as np
from PIL import Image
source=pathlib.Path(sys.argv[1]);output=pathlib.Path(sys.argv[2]);raw=source.read_bytes()
jl=struct.unpack_from('<I',raw,12)[0];data=json.loads(raw[20:20+jl]);start=20+jl;binary=raw[start+8:start+8+struct.unpack_from('<I',raw,start)[0]]
images={i['bufferView']:i for i in data.get('images',[])};pieces=[];offset=0
for idx,v in enumerate(data['bufferViews']):
    content=binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']]
    if idx in images:
        im=Image.open(io.BytesIO(content)).convert('RGBA');a=np.array(im);valid=a[:,:,3]>5
        # A 16 pixel gutter prevents black seams under bilinear/mipmap filtering.
        for _ in range(16):
            old=valid.copy();rgb=a[:,:,:3].copy()
            for dy,dx in ((0,1),(0,-1),(1,0),(-1,0)):
                shifted=np.roll(old,(dy,dx),(0,1));mask=(~valid)&shifted
                a[:,:,:3][mask]=np.roll(rgb,(dy,dx),(0,1))[mask];valid|=mask
        preserve_alpha='Glasses' in images[idx].get('name','')
        if preserve_alpha:
            # Glass transparency is part of the source appearance, not an empty UV gutter.
            valid=a[:,:,3]>5
            for _ in range(16):
                old=valid.copy();rgba=a.copy()
                for dy,dx in ((0,1),(0,-1),(1,0),(-1,0)):
                    shifted=np.roll(old,(dy,dx),(0,1));mask=(~valid)&shifted
                    a[mask]=np.roll(rgba,(dy,dx),(0,1))[mask];valid|=mask
        out=io.BytesIO();Image.fromarray(a if preserve_alpha else a[:,:,:3]).save(out,format='PNG',optimize=True);content=out.getvalue();images[idx]['mimeType']='image/png'
    pad=(-offset)%4
    if pad:pieces.append(bytes(pad));offset+=pad
    v['byteOffset']=offset;v['byteLength']=len(content);pieces.append(content);offset+=len(content)
for mat in data['materials']:
    mat['pbrMetallicRoughness']={'baseColorFactor':mat.get('emissiveFactor',[1,1,1])+[1],'metallicFactor':0,'roughnessFactor':1}
    if 'emissiveTexture' in mat:mat['pbrMetallicRoughness']['baseColorTexture']=mat.pop('emissiveTexture')
    mat.pop('emissiveFactor',None);mat['extensions']={'KHR_materials_unlit':{}}
    if 'Head_WEB_OUTLINE' in mat['name']:mat['extras']={'pgiFaceOutline':{'blend':.05,'rampMaximum':.154546}}
    if 'Glasses_WEB_RADIANCE' in mat['name']:
        mat['alphaMode']='BLEND'
        # Closed lens surfaces should not be blended a second time from the back.
        mat['doubleSided']=False
data['extensionsUsed']=['KHR_materials_unlit'];data.pop('extensionsRequired',None)
blob=b''.join(pieces);blob+=bytes((-len(blob))%4);data['buffers'][0]['byteLength']=len(blob)
encoded=json.dumps(data,separators=(',',':')).encode();encoded+=b' '*((-len(encoded))%4)
result=struct.pack('<III',0x46546c67,2,28+len(encoded)+len(blob))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(blob),0x004e4942)+blob
output.write_bytes(result)
print(json.dumps({'file':str(output),'bytes':len(result),'sha256':hashlib.sha256(result).hexdigest(),'images':len(images),'materials':len(data['materials'])}))
