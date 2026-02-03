// 高德地图 TypeScript 类型声明
declare namespace AMap {
  class Map {
    constructor(container: string | HTMLElement, options?: MapOptions);
    destroy(): void;
    setCenter(center: [number, number]): void;
    setZoom(zoom: number): void;
    getZoom(): number;
    getCenter(): LngLat;
    setZoomAndCenter(zoom: number, center: [number, number]): void;
    panTo(position: [number, number]): void;
    on(event: string, handler: (e: any) => void): void;
    add(overlay: any): void;
    remove(overlay: any): void;
    clearMap(): void;
    setMapStyle(style: string): void;
    setFitView(overlays?: any[], immediately?: boolean, avoid?: number[], maxZoom?: number): void;
  }

  interface MapOptions {
    zoom?: number;
    center?: [number, number];
    viewMode?: '2D' | '3D';
    pitch?: number;
    rotation?: number;
    zooms?: [number, number];
    mapStyle?: string;
    features?: string[];
    layers?: any[];
    showLabel?: boolean;
    dragEnable?: boolean;
    zoomEnable?: boolean;
    doubleClickZoom?: boolean;
    keyboardEnable?: boolean;
    scrollWheel?: boolean;
    touchZoom?: boolean;
    touchZoomCenter?: number;
    showBuildingBlock?: boolean;
  }

  class LngLat {
    constructor(lng: number, lat: number);
    getLng(): number;
    getLat(): number;
    offset(w: number, s: number): LngLat;
    distance(lnglat: LngLat): number;
  }

  class Marker {
    constructor(options?: MarkerOptions);
    setPosition(position: [number, number]): void;
    getPosition(): LngLat;
    setContent(content: string | HTMLElement): void;
    setLabel(label: { content: string; offset?: Pixel; direction?: string }): void;
    setIcon(icon: Icon | string): void;
    setAnimation(animation: string): void;
    on(event: string, handler: (e: any) => void): void;
    setExtData(data: any): void;
    getExtData(): any;
    show(): void;
    hide(): void;
    remove(): void;
  }

  interface MarkerOptions {
    position?: [number, number];
    offset?: Pixel;
    icon?: Icon | string;
    content?: string | HTMLElement;
    anchor?: string;
    angle?: number;
    clickable?: boolean;
    draggable?: boolean;
    cursor?: string;
    label?: { content: string; offset?: Pixel; direction?: string };
    zIndex?: number;
    extData?: any;
  }

  class Icon {
    constructor(options: IconOptions);
  }

  interface IconOptions {
    size?: Size;
    imageOffset?: Pixel;
    image?: string;
    imageSize?: Size;
  }

  class Size {
    constructor(width: number, height: number);
    getWidth(): number;
    getHeight(): number;
  }

  class Pixel {
    constructor(x: number, y: number);
    getX(): number;
    getY(): number;
  }

  class Polyline {
    constructor(options?: PolylineOptions);
    setPath(path: [number, number][]): void;
    getPath(): LngLat[];
    setOptions(options: PolylineOptions): void;
    show(): void;
    hide(): void;
    remove(): void;
  }

  interface PolylineOptions {
    path?: [number, number][];
    strokeColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
    strokeStyle?: 'solid' | 'dashed';
    strokeDasharray?: number[];
    lineJoin?: string;
    lineCap?: string;
    zIndex?: number;
    showDir?: boolean;
    geodesic?: boolean;
    isOutline?: boolean;
    outlineColor?: string;
    borderWeight?: number;
  }

  class InfoWindow {
    constructor(options?: InfoWindowOptions);
    open(map: Map, position: [number, number]): void;
    close(): void;
    setContent(content: string | HTMLElement): void;
    setPosition(position: [number, number]): void;
    on(event: string, handler: (e: any) => void): void;
  }

  interface InfoWindowOptions {
    isCustom?: boolean;
    autoMove?: boolean;
    closeWhenClickMap?: boolean;
    content?: string | HTMLElement;
    offset?: Pixel;
    anchor?: string;
    position?: [number, number];
  }

  class PlaceSearch {
    constructor(options?: PlaceSearchOptions);
    search(keyword: string, callback: (status: string, result: PlaceSearchResult) => void): void;
    searchNearBy(keyword: string, center: [number, number], radius: number, callback: (status: string, result: PlaceSearchResult) => void): void;
    setCity(city: string): void;
  }

  interface PlaceSearchOptions {
    city?: string;
    citylimit?: boolean;
    children?: number;
    type?: string;
    lang?: string;
    pageSize?: number;
    pageIndex?: number;
    extensions?: 'base' | 'all';
  }

  interface PlaceSearchResult {
    info: string;
    poiList?: {
      pois: POI[];
      pageIndex: number;
      pageSize: number;
      count: number;
    };
  }

  interface POI {
    id: string;
    name: string;
    type: string;
    location: LngLat;
    address: string;
    tel?: string;
    distance?: number;
    citycode?: string;
    cityname?: string;
    adcode?: string;
    adname?: string;
    photos?: { url: string }[];
  }

  class AutoComplete {
    constructor(options?: AutoCompleteOptions);
    search(keyword: string, callback: (status: string, result: AutoCompleteResult) => void): void;
    setCity(city: string): void;
  }

  interface AutoCompleteOptions {
    type?: string;
    city?: string;
    datatype?: string;
    citylimit?: boolean;
    input?: string | HTMLInputElement;
    output?: string | HTMLElement;
    outPutDirAuto?: boolean;
  }

  interface AutoCompleteResult {
    info: string;
    count: number;
    tips: AutoCompleteTip[];
  }

  interface AutoCompleteTip {
    id: string;
    name: string;
    district: string;
    address: string;
    location: LngLat;
    typecode: string;
  }

  class Geocoder {
    constructor(options?: GeocoderOptions);
    getAddress(location: [number, number], callback: (status: string, result: ReGeocodeResult) => void): void;
    getLocation(address: string, callback: (status: string, result: GeocodeResult) => void): void;
  }

  interface GeocoderOptions {
    city?: string;
    radius?: number;
    lang?: string;
    batch?: boolean;
    extensions?: 'base' | 'all';
  }

  interface ReGeocodeResult {
    info: string;
    regeocode: {
      formattedAddress: string;
      addressComponent: {
        province: string;
        city: string;
        district: string;
        street: string;
        streetNumber: string;
        neighborhood: string;
        building: string;
      };
      pois: POI[];
    };
  }

  interface GeocodeResult {
    info: string;
    geocodes: {
      formattedAddress: string;
      location: LngLat;
      addressComponent: {
        province: string;
        city: string;
        district: string;
      };
    }[];
  }

  class Driving {
    constructor(options?: DrivingOptions);
    search(origin: [number, number], destination: [number, number], callback: (status: string, result: DrivingResult) => void): void;
    clear(): void;
  }

  interface DrivingOptions {
    map?: Map;
    panel?: string | HTMLElement;
    policy?: number;
    extensions?: 'base' | 'all';
    ferry?: number;
    showTraffic?: boolean;
  }

  interface DrivingResult {
    info: string;
    routes: {
      distance: number;
      time: number;
      steps: {
        instruction: string;
        distance: number;
        time: number;
        path: LngLat[];
      }[];
    }[];
  }

  class Walking {
    constructor(options?: WalkingOptions);
    search(origin: [number, number], destination: [number, number], callback: (status: string, result: WalkingResult) => void): void;
    clear(): void;
  }

  interface WalkingOptions {
    map?: Map;
    panel?: string | HTMLElement;
  }

  interface WalkingResult {
    info: string;
    routes: {
      distance: number;
      time: number;
      steps: {
        instruction: string;
        distance: number;
        time: number;
        path: LngLat[];
      }[];
    }[];
  }

  class Transfer {
    constructor(options?: TransferOptions);
    search(origin: [number, number], destination: [number, number], callback: (status: string, result: TransferResult) => void): void;
    clear(): void;
  }

  interface TransferOptions {
    map?: Map;
    city?: string;
    panel?: string | HTMLElement;
    policy?: number;
    nightflag?: boolean;
    extensions?: 'base' | 'all';
  }

  interface TransferResult {
    info: string;
    plans: {
      distance: number;
      time: number;
      path: LngLat[];
      segments: {
        instruction: string;
        distance: number;
        time: number;
        transit_mode: string;
      }[];
    }[];
  }

  // 插件加载
  function plugin(plugins: string | string[], callback: () => void): void;
}

// 全局声明
interface Window {
  AMap: typeof AMap;
}
