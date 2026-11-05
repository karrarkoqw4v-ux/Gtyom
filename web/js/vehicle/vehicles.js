// أنواع المركبات
export const VEHICLES = {
  car:  { name: 'سيارة',        icon: 'car',  profile: 'car',  speed: 13.9, zoom: 17.2, pitch: 62 },
  moto: { name: 'دراجة نارية',  icon: 'moto', profile: 'car',  speed: 12.5, zoom: 17.4, pitch: 64 },
  bike: { name: 'دراجة هوائية', icon: 'bike', profile: 'bike', speed: 4.5,  zoom: 18.2, pitch: 67 },
  walk: { name: 'مشي',          icon: 'walk', profile: 'foot', speed: 1.4,  zoom: 18.8, pitch: 72 }
};
export const vehicle = key => VEHICLES[key] || VEHICLES.car;
