// أنواع الأماكن، لكل نوع أيقونة خطّية ولون
export const CATEGORIES = [
  { id: 'fuel',     name: 'محطات وقود', one: 'محطة وقود', icon: 'fuel',     color: '#e8590c', q: ['["amenity"="fuel"]'], tile: { class: ['fuel'], sub: [] } },
  { id: 'bus',      name: 'محطات نقل',  one: 'محطة نقل',  icon: 'bus',      color: '#1d6fe0', q: ['["amenity"="bus_station"]', '["public_transport"="station"]'], tile: { class: ['bus', 'railway'], sub: ['bus_station'] } },
  { id: 'market',   name: 'أسواق',      one: 'سوق',       icon: 'bag',      color: '#d6336c', q: ['["amenity"="marketplace"]', '["shop"="supermarket"]'], tile: { class: ['grocery'], sub: ['supermarket', 'marketplace'] } },
  { id: 'mall',     name: 'مولات',      one: 'مول',       icon: 'mall',     color: '#7048e8', q: ['["shop"="mall"]', '["shop"="department_store"]'], tile: { class: [], sub: ['mall', 'department_store'] } },
  { id: 'food',     name: 'مطاعم',      one: 'مطعم',      icon: 'food',     color: '#f08c00', q: ['["amenity"~"^(restaurant|fast_food|cafe)$"]'], tile: { class: ['restaurant', 'fast_food', 'cafe'], sub: [] } },
  { id: 'health',   name: 'مستشفيات',   one: 'مستشفى',    icon: 'hospital', color: '#e03131', q: ['["amenity"~"^(hospital|clinic)$"]'], tile: { class: ['hospital'], sub: ['hospital', 'clinic'] } },
  { id: 'pharmacy', name: 'صيدليات',    one: 'صيدلية',    icon: 'pill',     color: '#0ca678', q: ['["amenity"="pharmacy"]'], tile: { class: ['pharmacy'], sub: [] } },
  { id: 'mosque',   name: 'جوامع',      one: 'جامع',      icon: 'mosque',   color: '#2b8a3e', q: ['["amenity"="place_of_worship"]["religion"="muslim"]'], tile: { class: [], sub: ['muslim'] } },
  { id: 'bank',     name: 'مصارف',      one: 'مصرف',      icon: 'bank',     color: '#1098ad', q: ['["amenity"~"^(bank|atm)$"]'], tile: { class: ['bank', 'atm'], sub: [] } },
  { id: 'parking',  name: 'مواقف',      one: 'موقف',      icon: 'parking',  color: '#364fc7', q: ['["amenity"="parking"]'], tile: { class: ['parking'], sub: [] } },
  { id: 'gov',      name: 'قصور ومجالس',  one: 'مبنى حكومي', icon: 'bank',     color: '#b8892b', q: ['["name"~"القصر الجمهوري|قصر السلام|مجلس الوزراء|مجلس النواب|رئاسة الجمهورية|مجلس القضاء|القصر الحكومي|رئاسة الوزراء|Republican Palace|Presidential|Council of Ministers|Council of Representatives|Parliament|Prime Minister"]', '["amenity"="townhall"]', '["office"="government"]["name"]', '["building"="government"]["name"]'], tile: { class: ['town_hall'], sub: ['government', 'townhall'] } },
  { id: 'hotel',    name: 'فنادق',      one: 'فندق',      icon: 'hotel',    color: '#ae3ec9', q: ['["tourism"="hotel"]'], tile: { class: ['lodging'], sub: ['hotel'] } }
];
export const category = id => CATEGORIES.find(c => c.id === id);
