public interface Maps {
    search: (config: any, query: string) => Promise<any[]>;
    reverse: (config: any, lat: number, lng: number) => Promise<{ address: string }>;
    nearby: (config: any, lat: number, lng: number) => Promise<any[]>;
}



public class GoogleMaps implements Maps: 
    search()
    reverse()
    nearby()


public class OSM implements Maps:
    search()
    reverse()
    nearby()
