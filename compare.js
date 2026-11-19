const products = [
  {id:'cmipf',label:'Cloud and moisture imagery (CMIPF)',description:'Reflectance factor: highlights reflected sunlight; exact channel needs verification.'},
  {id:'achtf',label:'Cloud-top temperature (ACHTF)',description:'Estimated cloud-top temperature in kelvin; blank pixels may indicate missing or unsuitable retrievals.'},
  {id:'radf',label:'Radiance (RadF)',description:'Measured radiance; interpretation depends on the channel, which needs verification.'},
  {id:'sstf',label:'Sea-surface temperature (SSTF)',description:'Estimated sea-surface skin temperature; clouds can limit retrievals.'},
  {id:'tpw',label:'Total precipitable water (TPW)',description:'Estimated atmospheric column water vapor, not rainfall.'}
];
for (const [side, selected] of [['left','cmipf'],['right','achtf']]) {
  const select=document.querySelector(`#compare-${side}`);
  const img=document.querySelector(`#compare-${side}-image`);
  const caption=document.querySelector(`#compare-${side}-caption`);
  for(const item of products) select.add(new Option(item.label,item.id));
  select.value=selected;
  const update=()=>{const item=products.find(d=>d.id===select.value);img.src=`frames/${item.id}/14_272.png`;img.alt=`GOES-16 ${item.label}, project image labeled day 272`;caption.textContent=item.description;};
  select.addEventListener('change',update); update();
}
