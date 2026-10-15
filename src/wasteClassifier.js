
import { pipeline } from '@huggingface/transformers';

let classifierPromise = null;


const wasteCategories = [
  // Recyclable materials
  'a clean plastic water bottle for recycling',
  'a cardboard box for recycling',
  'a piece of paper or newspaper for recycling',
  'a glass bottle or jar for recycling',
  'an aluminum or steel can for recycling',

  // Reusable materials
  'a reusable water bottle',
  'a reusable glass jar or food container',
  'a reusable shopping bag',
  'a reusable cloth bag',
  'a piece of reusable clothing or fabric',

  // Biodegradable materials
  'food scraps or leftover food',
  'banana peels or fruit scraps',
  'vegetable peels or kitchen waste',
  'dry leaves or garden waste',
  'biodegradable paper waste',

  // Hazardous materials
  'a used household battery',
  'electronic waste such as a broken mobile phone',
  'a fluorescent light bulb',
  'a container of household chemical waste',
  'medical waste such as a used syringe',
  'a pesticide or chemical container with hazardous residue',

    // Sanitary waste
  'a used sanitary pad',
  'a used tampon',
  'a used baby diaper',
  'used personal hygiene waste',

  // Other common waste
  'a plastic shopping bag',
  'a disposable plastic cup',
  'mixed waste that cannot be identified clearly',
];


export async function classifyWaste(imageFile) {
  if (!classifierPromise) {
    classifierPromise = pipeline(
      'zero-shot-image-classification',
      'onnx-community/clip-vit-base-patch16-ONNX'
    );
  }

  const classifier = await classifierPromise;
  const imageURL = URL.createObjectURL(imageFile);

  try {
    return await classifier(imageURL, wasteCategories);
  } finally {
    URL.revokeObjectURL(imageURL);
  }
}
