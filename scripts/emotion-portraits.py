from PIL import Image
from pathlib import Path
root=Path(__file__).resolve().parent.parent
for key in ['miedo','tristeza','enojo','asco']:
 im=Image.open(root/'evidence'/'emotions'/key/'portrait.png').convert('RGBA')
 im.thumbnail((512,512),Image.Resampling.LANCZOS)
 im.save(root/'public'/'emotions'/key/'portrait.webp',lossless=True)
