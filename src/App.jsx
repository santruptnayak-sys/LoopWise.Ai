import { useState, useEffect } from 'react';
import './App.css'
import { classifyWaste } from './wasteClassifier.js'
console.log('App.jsx is running!');

function getRecyclingAdvice(label) {
  const material = label.toLowerCase();

  if (material.includes("plastic bottle")) {
    return {
      title: "Recycle the plastic bottle",
      recommendation: "RECYCLE",
      action: "Empty it, rinse if needed, and let it drain.",
      preparation: "Check whether your local collection service accepts this type of plastic.",
      caution: "Do not put a bottle with chemicals or hazardous contents into regular recycling.",
    };
  }

  if (material.includes("plastic bag")) {
    return {
      title: "Check plastic bag collection options",
      recommendation: "CHECK LOCAL RULES",
      action: "Keep the bag clean and dry.",
      preparation: "Use a designated collection point if one is available.",
      caution: "Loose plastic bags can jam sorting machinery, so do not place them in mixed recycling unless accepted locally.",
    };
  }

  if (
    material.includes("paper") ||
    material.includes("cardboard") ||
    material.includes("newspaper")
  ) {
    return {
      title: "Recycle paper or cardboard",
      recommendation: "RECYCLE",
      action: "Keep it dry and remove food residue.",
      preparation: "Flatten cardboard boxes and remove non-paper packaging where practical.",
      caution: "Greasy or food-soiled paper may not be accepted with ordinary paper recycling.",
    };
  }

  if (material.includes("glass")) {
    return {
      title: "Sort glass carefully",
      recommendation: "RECYCLE IF ACCEPTED",
      action: "Keep glass separate according to local collection rules.",
      preparation: "Empty the container and rinse if needed.",
      caution: "Broken glass can cause injuries. Follow local instructions for wrapping and disposal.",
    };
  }

  if (
    material.includes("aluminum") ||
    material.includes("aluminium") ||
    material.includes("steel") ||
    material.includes("can")
  ) {
    return {
      title: "Check metal can recycling",
      recommendation: "RECYCLE IF ACCEPTED",
      action: "Empty the can and rinse if needed.",
      preparation: "Keep it separate if your local collection service requires it.",
      caution: "Do not handle sharp edges with bare hands.",
    };
  }

  if (
    material.includes("food") ||
    material.includes("organic") ||
    material.includes("compost")
  ) {
    return {
      title: "Consider composting",
      recommendation: "COMPOST",
      action: "Separate food scraps from recyclable packaging.",
      preparation: "Use a compost bin or organic-waste collection service that accepts the material.",
      caution: "Meat, dairy, oils, and other scraps may have different rules depending on the composting system.",
    };
  }

  if (material.includes("battery")) {
    return {
      title: "Use a battery collection point",
      recommendation: "SPECIAL DISPOSAL",
      action: "Keep the battery out of ordinary household waste and mixed recycling.",
      preparation: "Take it to an appropriate battery collection or e-waste facility.",
      caution: "Do not puncture, crush, or burn batteries. If a battery is damaged or swollen, avoid handling it and seek local safety guidance.",
    };
  }

  if (material.includes("fabric") || material.includes("clothing")) {
    return {
      title: "Reuse or donate textiles",
      recommendation: "REUSE OR DONATE",
      action: "Check whether the item can be repaired, reused, or donated.",
      preparation: "Keep donated clothing clean and dry.",
      caution: "Heavily damaged textiles may require a specialist collection service.",
    };
  }

  return {
    title: "Check before disposing",
    recommendation: "CHECK DISPOSAL RULES",
    action: "Identify the material and keep it separate until you know the correct disposal route.",
    preparation: "Check the instructions from your local waste collection service.",
    caution: "Do not assume every item is recyclable just because it is made of a recyclable material.",
  };
}


function App(){
  const [itemsProcessed, setItemsProcessed] = useState(() => {
  return Number(localStorage.getItem('loopwise-items-processed') || 0);
});
useEffect(() => {
  localStorage.setItem('loopwise-items-processed', String(itemsProcessed));
}, [itemsProcessed]);
  const [prediction, setPrediction] = useState(null);
  
const [correctedMaterial, setCorrectedMaterial] = useState("");


const [materialCounts, setMaterialCounts] = useState(() => {
  try {
    const savedCounts = localStorage.getItem('loopwise-material-counts');

    if (savedCounts) {
      return {
        Recyclable: 0,
        Reusable: 0,
        Biodegradable: 0,
        Hazardous: 0,
        'Sanitary Waste': 0,
        ...JSON.parse(savedCounts),
      };
    }
  } catch (error) {
    console.error('Could not load saved material counts:', error);
  }

  return {
    Recyclable: 0,
    Reusable: 0,
    Biodegradable: 0,
    Hazardous: 0,
      'Sanitary Waste': 0,
  };
});


useEffect(() => {
  localStorage.setItem(
    'loopwise-material-counts',
    JSON.stringify(materialCounts)
  );
}, [materialCounts]);


const circularImpact = [
  {
    name: 'Potentially reusable',
    count: materialCounts.Reusable,
    icon: '🔁',
    description: 'Items that may be used again if safe and suitable.',
  },
  {
    name: 'Potentially recyclable',
    count: materialCounts.Recyclable,
    icon: '♻️',
    description: 'Items that may enter a recycling stream.',
  },
  {
    name: 'Potentially compostable',
    count: materialCounts.Biodegradable,
    icon: '🌱',
    description: 'Items suitable for organic waste collection or composting.',
  },
  {
    name: 'Hazardous items identified',
    count: materialCounts.Hazardous,
    icon: '⚠️',
    description: 'Items that need an appropriate collection or disposal route.',
  },
];


const totalScanned = Object.values(materialCounts).reduce(
  (total, count) => total + count,
  0
);

const mostScannedCategory =
  Object.entries(materialCounts).sort((a, b) => b[1] - a[1])[0];

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [imageName, setImageName] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState('Identify Waste')

  const tabs = ['Identify Waste', 'Material Flow', 'AI Recycling Guide']

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#">
          <span className="brand-icon">↻</span>
          LoopWise<span className="brand-ai">AI</span>
        </a>

        

        <span className="status">
          <span className="status-dot" />
          Sustainability hub
        </span>
      </header>

      <main>
       
<section className="hero">
  <div className="hero-copy">
    <span className="eyebrow">♻ SMARTER CHOICES, LESS WASTE</span>

    <h1>
      Give waste a<br />
      <span>second life.</span>
    </h1>

    <p>
      Identify materials, discover smarter disposal choices,
      and see how your waste moves through a circular future.
    </p>

    <button
      className="primary-button"
      onClick={() => {
        document.getElementById('assistant-intro')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }}
    >
      Explore the assistant <span>→</span>
    </button>
  </div>
</section>


<section className="how-it-works">
  <span className="eyebrow">HOW IT WORKS</span>
  <h2>From waste to better choices.</h2>

  <div className="steps-grid">
    <div className="step-card">
      <span className="step-number">01</span>
      <h3>Identify</h3>
      <p>Recognize the material from an image.</p>
    </div>

    <div className="step-card">
      <span className="step-number">02</span>
      <h3>Understand</h3>
      <p>Discover reuse and disposal options.</p>
    </div>

    <div className="step-card">
      <span className="step-number">03</span>
      <h3>Track</h3>
      <p>See the material enter a virtual bin.</p>
    </div>
  </div>
</section>


<section id="assistant-intro" className="assistant-intro">
  <nav>
    {tabs.map((tab) => (
      <button
        key={tab}
        className={activeTab === tab ? 'nav-link active' : 'nav-link'}
        onClick={() => {
          setActiveTab(tab);

          const sectionIds = {
            'Identify Waste': 'identify-waste-section',
            'Material Flow': 'material-flow-section',
            'AI Recycling Guide': 'recycling-guide-section',
          };

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              document.getElementById(sectionIds[tab])?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            });
          });
        }}
      >
        {tab}
      </button>
    ))}
  </nav>

  <div className="hero-art">
    <div className="orbit orbit-one" />
    <div className="orbit orbit-two" />
    <div className="planet">♻</div>
    <span className="float-card card-one">🌱 Less waste</span>
    <span className="float-card card-two">🌍 More impact</span>
    <span className="leaf leaf-one">✦</span>
    <span className="leaf leaf-two">✳</span>
  </div>
</section>

        <section className="stats">
          <div className="stat-card">
            <span className="stat-icon">♻</span>
            <div><p>Items processed</p><h2>{itemsProcessed}</h2></div>
            <span className="stat-note">Demo data</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🌿</span>
            <div><p>Material categories</p><h2>4</h2></div>
            <span className="stat-note">Tracked</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">♧</span>
            <div><p>Virtual bins</p><h2>4</h2></div>
            <span className="stat-note">Simulated</span>
          </div>
        </section>

        <section className="workspace">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR CIRCULAR JOURNEY</span>
              <h2>{activeTab}</h2>
            </div>
            <span className="demo-badge">Prototype preview</span>
          </div>

          {activeTab === 'Identify Waste' && (
             <div id="identify-waste-section" className="feature-grid">
              <div className="upload-card">
                <div className="upload-symbol">↑</div>
                <h3>What are we looking at?</h3>
                <p>Start with a waste item. Image recognition will be connected next.</p>
                
<label className="upload-label">
  Choose an image
  <input
    type="file"
    accept="image/*"
    
onChange={async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const imageURL = URL.createObjectURL(file);
  setPreviewImage(imageURL);
  setImageName(file.name);
  setAnalysisError('');
  setIsAnalyzing(true);

  try {
   
const results = await classifyWaste(file);
setItemsProcessed((count) => count + 1);
console.log('Waste predictions:', results);


if (results && results.length > 0) {
  const bestPrediction = results[0];
  setPrediction(bestPrediction);

  const label = bestPrediction.label.toLowerCase();

  let category = "Other";


if (
  label.includes("sanitary pad") ||
  label.includes("tampon") ||
  label.includes("diaper") ||
  label.includes("personal hygiene waste")
) {
  category = "Sanitary Waste";
} else if (
  label.includes("battery") ||
  label.includes("electronic waste") ||
  label.includes("mobile phone") ||
  label.includes("chemical") ||
  label.includes("pesticide") ||
  label.includes("syringe") ||
  label.includes("medical waste") ||
  label.includes("fluorescent")
) {
  category = "Hazardous";
} else if (
  label.includes("reusable") ||
  label.includes("reusable water bottle") ||
  label.includes("shopping bag") ||
  label.includes("cloth bag") ||
  label.includes("clothing") ||
  label.includes("fabric")
) {
  category = "Reusable";
} else if (
  label.includes("food") ||
  label.includes("organic") ||
  label.includes("compost") ||
  label.includes("banana") ||
  label.includes("fruit") ||
  label.includes("vegetable") ||
  label.includes("leaves") ||
  label.includes("garden waste") ||
  label.includes("biodegradable")
) {
  category = "Biodegradable";
} else if (
  label.includes("plastic") ||
  label.includes("paper") ||
  label.includes("cardboard") ||
  label.includes("newspaper") ||
  label.includes("glass") ||
  label.includes("metal") ||
  label.includes("aluminum") ||
  label.includes("aluminium") ||
  label.includes("steel") ||
  label.includes("can")
) {
  category = "Recyclable";
}


 
setMaterialCounts((previousCounts) => ({
  ...previousCounts,
  [category]: (previousCounts[category] ?? 0) + 1,
}));


  console.log("Updated virtual bin:", category);
}

  } catch (error) {
    console.error('Classification failed:', error);
    setAnalysisError('Could not analyze this image. Please try again.');
  } finally {
    setIsAnalyzing(false);
  }
}}

  />
</label>

                <span className="helper-text">JPG, PNG or WEBP</span>
              </div>

              
{previewImage && (
  <div className="image-preview">
    <img src={previewImage} alt="Uploaded waste preview" />
     <p className="image-name">{imageName}</p>
     {isAnalyzing && <p>Loading AI model and analyzing image...</p>}
     {analysisError && <p role="alert">{analysisError}</p>}
    <button
      type="button"
      onClick={() => {
        setImageName('');
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }}
    >
      Remove image
    </button>
  </div>
)}


{previewImage && (
 
<div className="result-card">
  <h3>♻️ Waste Analysis</h3>

  {prediction ? (
    <>
      <p>
        <strong>Detected item:</strong> {prediction.label}

      </p>
      
<div className="material-correction">
  <label htmlFor="material-select">
    Wrong prediction? Choose the correct material:
  </label>

  <select
    id="material-select"
    value={correctedMaterial}
    onChange={(event) => setCorrectedMaterial(event.target.value)}
  >
    <option value="">Use AI prediction</option>
    <option value="Plastic">Plastic</option>
    <option value="Paper">Paper / Cardboard</option>
    <option value="Glass">Glass</option>
    <option value="Metal">Metal</option>
    <option value="Organic">Food / Organic waste</option>
    <option value="Battery">Battery</option>
    <option value="Textile">Clothing / Fabric</option>
    <option value="Other">Other</option>
  </select>
</div>

<div className="recommendation-badge">
  <span>♻️ Recommended action</span>
 

<strong>
  {prediction.score < 0.60 && !correctedMaterial
    ? "PLEASE VERIFY ITEM"
    : getRecyclingAdvice(
  correctedMaterial
    ? {
        Plastic: "a plastic water bottle",
        Paper: "a piece of paper or newspaper",
        Glass: "a glass bottle or jar",
        Metal: "an aluminum or steel can",
        Organic: "food scraps or organic waste",
        Battery: "a used battery",
        Textile: "clothing or fabric",
        Other: "an unknown item",
      }[correctedMaterial]
    : prediction.label
).recommendation
}
</strong>


</div>


      <p>
        <strong>Model score:</strong>{" "}
        {(prediction.score * 100).toFixed(1)}%
      </p>
      
{prediction.score < 0.60 && (
  <div className="confidence-warning">
    <strong>⚠️ Not sure about this item?</strong>
    <p>
      The AI is less confident in this prediction.
      Please check the detected item and confirm its material
      before following the disposal recommendation.
    </p>
  </div>
)}


     
{(() => {
  
const selectedLabel = correctedMaterial
  ? {
      Plastic: "a plastic water bottle",
      Paper: "a piece of paper or newspaper",
      Glass: "a glass bottle or jar",
      Metal: "an aluminum or steel can",
      Organic: "food scraps or organic waste",
      Battery: "a used battery",
      Textile: "clothing or fabric",
      Other: "an unknown item",
    }[correctedMaterial]
  : prediction.label;

const advice = getRecyclingAdvice(selectedLabel);


  return (
    <div className="recycling-advice">
      <h4>💡 {advice.title}</h4>

      <p>
        <strong>What to do:</strong> {advice.action}
      </p>

      <p>
        <strong>How to prepare:</strong> {advice.preparation}
      </p>

      <p>
        <strong>Important:</strong> {advice.caution}
      </p>
    </div>
  );
})()}

      <p className="demo-note">
        AI-assisted estimate. The model score is not a guarantee of accuracy.
        Confirm the material and local recycling rules before disposal.
      </p>
    </>
  ) : (
    <>
      <p>Upload an image to see the predicted waste category.</p>
      <p className="demo-note">
        Predictions are generated by an image-classification model.
      </p>
    </>
  )}
</div>

)}
            </div>
          )}

          {activeTab === 'Material Flow' && (
           
  <>
    <div id="material-flow-section" className="flow-summary">
      <div className="summary-card">
        <span className="summary-icon">♻️</span>
        <div>
          <p>Total Items Scanned</p>
          <h2>{totalScanned}</h2>
        </div>
      </div>

      <div className="summary-card">
        <span className="summary-icon">🏆</span>
        <div>
          <p>Most Scanned Category</p>
          <h2>
            {totalScanned === 0 ? 'No scans yet' : mostScannedCategory[0]}
          </h2>
        </div>
      </div>
    </div>

    <div className="bins-grid">
      {/* Keep your existing bin cards here */}
    </div>
  </>
)}
            
            
            <div className="bins-grid">


{[
  {
    name: 'Recyclable',
    icon: '♻️',
    count: materialCounts.Recyclable ?? 0,
  },
  {
    name: 'Reusable',
    icon: '🔁',
    count: materialCounts.Reusable ?? 0,
  },
  {
    name: 'Biodegradable',
    icon: '🌱',
    count: materialCounts.Biodegradable ?? 0,
  },
  {
    name: 'Hazardous',
    icon: '⚠️',
    count: materialCounts.Hazardous ?? 0,
  },
  {name: 'Sanitary Waste',
   icon: '🧻', count: materialCounts['Sanitary Waste'] ?? 0},
].map((bin) => (


               
<div className="bin-card" key={bin.name}>
  <span className="bin-icon">{bin.icon}</span>
  <h3>{bin.name}</h3>

  <div className="progress-track">
    <div
      className="progress-fill"
      style={{
        width: `${Math.min(bin.count * 10, 100)}%`,
      }}
    />
  </div>

  <p>{bin.count} scanned {bin.count === 1 ? 'item' : 'items'}</p>
  <p>{Math.min(bin.count * 10, 100)}% virtual capacity</p>
</div>

              ))}
              <p className="simulation-note">Illustrative simulation — these are not live sensor readings.</p>
            </div>
          

{activeTab === 'AI Recycling Guide' && (
  <div id="recycling-guide-section" className="guide-card">
    <span className="guide-icon">✧</span>
    <span className="eyebrow">PERSONALIZED RECYCLING GUIDE</span>

    <h3>
      {prediction
        ? `What to do with ${prediction.label}`
        : 'Your waste, your next step.'}
    </h3>

    {!prediction ? (
      <div>
        <p>
          Upload a waste image in Identify Waste first. LoopWise will
          suggest a category and show you practical disposal guidance here.
        </p>
        <button
          className="primary-button"
          onClick={() => {
            setActiveTab('Identify Waste');
            document.getElementById('identify-waste-section')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }}
        >
          Identify an item →
        </button>
      </div>
    ) : (
      <>
        <p>
          <strong>Predicted material:</strong> {prediction.label}
        </p>

        {(() => {
          const label = prediction.label.toLowerCase();

          if (
            label.includes('battery') ||
            label.includes('chemical') ||
            label.includes('pesticide') ||
            label.includes('syringe') ||
            label.includes('medical waste') ||
            label.includes('fluorescent') ||
            label.includes('electronic waste') ||
            label.includes('mobile phone')
          ) {
            return (
              <div>
                <h4>⚠️ Hazardous waste guidance</h4>
                <ul>
                  <li>Keep this item separate from ordinary household waste.</li>
                  <li>Take it to an appropriate authorized collection point.</li>
                  <li>Do not burn, dismantle, or open it.</li>
                </ul>
              </div>
            );
          }

          if (
            label.includes('food') ||
            label.includes('organic') ||
            label.includes('banana') ||
            label.includes('fruit') ||
            label.includes('vegetable') ||
            label.includes('leaves') ||
            label.includes('garden waste') ||
            label.includes('biodegradable')
          ) {
            return (
              <div>
                <h4>🌱 Biodegradable waste guidance</h4>
                <ul>
                  <li>Place food scraps and suitable garden waste in an organic-waste or compost collection stream.</li>
                  <li>Keep them separate from dry recyclables.</li>
                  <li>Follow your local composting or collection rules.</li>
                </ul>
              </div>
            );
          }

          if (
            label.includes('reusable') ||
            label.includes('shopping bag') ||
            label.includes('cloth bag') ||
            label.includes('clothing') ||
            label.includes('fabric') ||
            label.includes('container')
          ) {
            return (
              <div>
                <h4>🔁 Reuse guidance</h4>
                <ul>
                  <li>Reuse the item if it is clean and safe for its intended purpose.</li>
                  <li>Consider donating usable clothing or containers.</li>
                  <li>If it is damaged or unsafe, check the appropriate recycling or disposal option.</li>
                </ul>
              </div>
            );
          }

          return (
            <div>
              <h4>♻️ Recycling guidance</h4>
              <ul>
                <li>Empty the item and clean it when appropriate.</li>
                <li>Separate it from food waste and other materials.</li>
                <li>Check whether your local collection service accepts this material.</li>
              </ul>
            </div>
          );
        })()}

        <p>
          <strong>Remember:</strong> This is guidance based on an AI image
          prediction. Confirm the material and follow local disposal rules.
        </p>
      </>
    )}
  </div>
)}

        </section>
        


<section className="impact-section">
  <div className="section-heading">
    <div>
      <span className="eyebrow">LOOPWISE AI / IMPACT ANALYTICS</span>
      <h2>Circular Impact Overview</h2>
      <p className="impact-intro">
        Material pathways identified from your waste scans.
      </p>
    </div>
    <span className="demo-badge">Live scan data</span>
  </div>

  <div className="impact-analytics">
    <div className="impact-chart-card">
      <div className="impact-card-heading">
        <div>
          <h3>Material composition</h3>
          <p>Distribution across identified categories</p>
        </div>
      </div>

      <div className="impact-chart-layout">
        <div className="impact-donut">
          <div className="donut-placeholder">
            <span>ITEMS</span>
            <strong>{Object.values(materialCounts).reduce(
              (total, count) => total + (Number(count) || 0), 0
            )}</strong>
            <span>ANALYZED</span>
          </div>
        </div>

        <div className="impact-legend">
          {[
            { name: 'Recyclable', color: '#249765' },
            { name: 'Reusable', color: '#397BC2' },
            { name: 'Biodegradable', color: '#D9A52C' },
            { name: 'Hazardous', color: '#D7655B' },
            { name: 'Sanitary Waste', color: '#8953B8' },
          ].map((item) => {
            const count = Number(materialCounts[item.name]) || 0;
            const total = Object.values(materialCounts).reduce(
              (sum, value) => sum + (Number(value) || 0), 0
            );
            const percentage = total > 0
              ? ((count / total) * 100).toFixed(1)
              : '0.0';

            return (
              <div className="impact-legend-row" key={item.name}>
                <span
                  className="impact-legend-dot"
                  style={{ backgroundColor: item.color }}
                />
                <span className="impact-legend-name">{item.name}</span>
                <strong>{count}</strong>
                <span className="impact-percentage">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    <div className="impact-insight-card">
      <span className="eyebrow">CIRCULAR PATHWAYS</span>
      <h3>From identification to action</h3>
      <p>
        Every identified item can inform a more appropriate
        reuse, recovery, or disposal decision.
      </p>

      {[
        { name: 'Recycling', category: 'Recyclable', color: '#249765' },
        { name: 'Reuse', category: 'Reusable', color: '#397BC2' },
        { name: 'Organic processing', category: 'Biodegradable', color: '#D9A52C' },
        { name: 'Safe disposal', category: 'Hazardous', color: '#D7655B' },
        { name: 'Sanitary disposal', category: 'Sanitary Waste', color: '#8953B8' },
      ].map((item) => {
        const count = Number(materialCounts[item.category]) || 0;
        const total = Object.values(materialCounts).reduce(
          (sum, value) => sum + (Number(value) || 0), 0
        );
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
          <div className="pathway-row" key={item.category}>
            <div className="pathway-label">
              <span>{item.name}</span>
              <strong>{percentage.toFixed(0)}%</strong>
            </div>
            <div className="pathway-track">
              <div
                className="pathway-fill"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>

  <p className="impact-disclaimer">
    Estimates are based on image classifications. Actual recovery and
    disposal options depend on material condition and local guidance.
  </p>
</section>




        <footer>
          <a className="brand footer-brand" href="#">↻ LoopWise<span className="brand-ai">AI</span></a>
          <p>A smarter path from waste to worth.</p>
          <span>Hackathon prototype · Simulated data</span>
        </footer>
      </main>
    </div>
  )
}

export default App
