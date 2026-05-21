// ===== CHARTS.JS — Chart.js Wrappers =====
let revenueChart=null,categoryChart=null,donutChart=null,productTrendChart=null;
const CHART_COLORS={violet:'#7C3AED',cyan:'#06B6D4',amber:'#F59E0B',green:'#10B981',red:'#EF4444',blue:'#3B82F6',grid:'rgba(255,255,255,0.06)',text:'rgba(255,255,255,0.5)'};
const CAT_COLORS=['#7C3AED','#06B6D4','#F59E0B','#10B981','#3B82F6','#EC4899'];
Chart.defaults.color=CHART_COLORS.text;Chart.defaults.borderColor=CHART_COLORS.grid;Chart.defaults.font.family='Inter,sans-serif';

function makeGradient(ctx,color,a1=0.4,a2=0){
  const h=color.replace('#',''),r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  const gr=ctx.createLinearGradient(0,0,0,350);
  gr.addColorStop(0,`rgba(${r},${g},${b},${a1})`);gr.addColorStop(1,`rgba(${r},${g},${b},${a2})`);return gr;
}

function initRevenueChart(){
  const canvas=document.getElementById('revenue-chart');if(!canvas)return;
  const ctx=canvas.getContext('2d');if(revenueChart)revenueChart.destroy();
  const {historical,predicted}=getOverallForecast(6);
  const allLabels=[...MONTHS,...['Jan','Feb','Mar','Apr','May','Jun'].map(m=>m+' (F)')];
  const histData=[...historical.map(v=>v/1000),...new Array(6).fill(null)];
  const predData=[...new Array(12).fill(null),...predicted.map(v=>v/1000)];
  predData[11]=historical[11]/1000;
  revenueChart=new Chart(ctx,{
    type:'line',data:{labels:allLabels,datasets:[
      {label:'Historical Revenue',data:histData,borderColor:CHART_COLORS.violet,backgroundColor:makeGradient(ctx,CHART_COLORS.violet,0.3,0),fill:true,tension:0.4,pointBackgroundColor:CHART_COLORS.violet,pointRadius:4,pointHoverRadius:7,borderWidth:2.5},
      {label:'AI Forecast',data:predData,borderColor:CHART_COLORS.cyan,backgroundColor:makeGradient(ctx,CHART_COLORS.cyan,0.2,0),fill:true,tension:0.4,borderDash:[8,4],pointBackgroundColor:CHART_COLORS.cyan,pointRadius:4,pointHoverRadius:7,borderWidth:2.5},
    ]},
    options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
      plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(10,15,30,0.95)',borderColor:'rgba(124,58,237,0.3)',borderWidth:1,padding:12,callbacks:{label:c=>` ${c.dataset.label}: $${c.parsed.y?c.parsed.y.toFixed(0):0}K`}}},
      scales:{x:{grid:{color:CHART_COLORS.grid},ticks:{maxRotation:45}},y:{grid:{color:CHART_COLORS.grid},ticks:{callback:v=>`$${v}K`}}}
    }
  });
}

function initCategoryChart(){
  const canvas=document.getElementById('category-chart');if(!canvas)return;
  const ctx=canvas.getContext('2d');if(categoryChart)categoryChart.destroy();
  categoryChart=new Chart(ctx,{
    type:'bar',
    data:{labels:MONTHS,datasets:CATEGORIES.map((cat,i)=>({label:cat,data:SALES_DATA[cat].monthly.map(v=>v/1000),backgroundColor:CAT_COLORS[i]+'CC',borderColor:CAT_COLORS[i],borderWidth:1,borderRadius:4}))},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:15}},tooltip:{backgroundColor:'rgba(10,15,30,0.95)',borderColor:'rgba(124,58,237,0.3)',borderWidth:1,callbacks:{label:c=>` ${c.dataset.label}: $${c.parsed.y.toFixed(0)}K`}}},
      scales:{x:{stacked:true,grid:{color:CHART_COLORS.grid}},y:{stacked:true,grid:{color:CHART_COLORS.grid},ticks:{callback:v=>`$${v}K`}}}
    }
  });
}

function initDonutChart(){
  const canvas=document.getElementById('donut-chart');if(!canvas)return;
  const ctx=canvas.getContext('2d');if(donutChart)donutChart.destroy();
  const totals=CATEGORIES.map(cat=>SALES_DATA[cat].monthly.reduce((a,b)=>a+b,0));
  donutChart=new Chart(ctx,{
    type:'doughnut',
    data:{labels:CATEGORIES,datasets:[{data:totals.map(v=>(v/1000).toFixed(0)),backgroundColor:CAT_COLORS.map(c=>c+'CC'),borderColor:CAT_COLORS,borderWidth:2,hoverOffset:8}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'65%',
      plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:12}},tooltip:{backgroundColor:'rgba(10,15,30,0.95)',borderColor:'rgba(124,58,237,0.3)',borderWidth:1,callbacks:{label:c=>` ${c.label}: $${Number(c.parsed).toLocaleString()}K`}}}
    }
  });
}

function initProductTrendChart(productId){
  const canvas=document.getElementById('product-trend-chart');if(!canvas)return;
  const ctx=canvas.getContext('2d');if(productTrendChart)productTrendChart.destroy();
  const product=PRODUCTS.find(p=>p.id===productId);if(!product)return;
  const predicted=predictNext(product.monthlySales,3);
  const histData=[...product.monthlySales,...new Array(3).fill(null)];
  const predData=[...new Array(12).fill(null),...predicted];predData[11]=product.monthlySales[11];
  productTrendChart=new Chart(ctx,{
    type:'line',data:{labels:[...MONTHS,'Jan+','Feb+','Mar+'],datasets:[
      {label:'Sales',data:histData,borderColor:CHART_COLORS.violet,backgroundColor:makeGradient(ctx,CHART_COLORS.violet,0.3,0),fill:true,tension:0.4,borderWidth:2,pointBackgroundColor:CHART_COLORS.violet,pointRadius:3},
      {label:'Forecast',data:predData,borderColor:CHART_COLORS.cyan,backgroundColor:'transparent',borderDash:[6,3],tension:0.4,borderWidth:2,pointBackgroundColor:CHART_COLORS.cyan,pointRadius:3},
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(10,15,30,0.95)',borderColor:'rgba(124,58,237,0.3)',borderWidth:1}},scales:{x:{grid:{color:CHART_COLORS.grid}},y:{grid:{color:CHART_COLORS.grid}}}}
  });
}
