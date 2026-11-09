import pathlib,json,math,sys
import numpy as np
from PIL import Image,ImageDraw,ImageFont
P=pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else pathlib.Path(__file__).resolve().parents[1]/'evidence';results=[]
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',22)
for a in (P/'blender').glob('*.png'):
 b=P/'browser'/a.name
 if not b.exists():continue
 A=np.array(Image.open(a).convert('RGBA'));B=np.array(Image.open(b).convert('RGBA'))
 ma=A[:,:,3]>127;mb=B[:,:,3]>127;mask=ma&mb
 delta=np.abs(A[:,:,:3].astype(float)-B[:,:,:3].astype(float));mse=np.square(delta[mask]).mean()
 result={'view':a.stem,'silhouetteIoU':float(np.sum(mask)/np.sum(ma|mb)),'meanAbsoluteRGB_0_255':float(delta[mask].mean()),'p95AbsoluteRGB_0_255':float(np.percentile(delta[mask],95)),'PSNR_foreground_dB':float(10*math.log10(255**2/max(mse,.00001))),'evaluatedPixels':int(mask.sum())};results.append(result)
 comp=Image.new('RGB',(A.shape[1]*3,A.shape[0]+50),'#18151c');draw=ImageDraw.Draw(comp)
 for i,(label,im) in enumerate([('BLENDER · fuente Eevee',Image.fromarray(A)),('NAVEGADOR · geometría real',Image.fromarray(B)),('DIFERENCIA × 3',Image.fromarray(np.uint8(np.clip(delta*3,0,255))))]):
  draw.text((i*A.shape[1]+15,10),label,font=font,fill='#fff0cb');comp.paste(im,(i*A.shape[1],50),im if im.mode=='RGBA' else None)
 comp.save(P/f'comparison-{a.stem}.jpg',quality=94)
(P/'comparison-metrics.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
rotations=list((P/'browser').glob('rotation-*.png'));sheet=Image.new('RGB',(4*300,3*440),'#141119');d=ImageDraw.Draw(sheet)
for i in range(12):
 im=Image.open(P/'browser'/f'rotation-{i}.png');im.thumbnail((300,400));x=i%4*300;y=i//4*440;sheet.paste(im,(x+(300-im.width)//2,y+30),im);d.text((x+14,y+5),f'{i*30}°',font=font,fill='#edbdcc')
sheet.save(P/'rotation-sheet.jpg',quality=94)
