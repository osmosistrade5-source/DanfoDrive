import axios from 'axios';

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const MapService = {
  /**
   * Verifies if a GPS coordinate is within a reasonable distance of a planned route
   */
  async verifyRouteCompliance(currentCoord: [number, number], routeId: string) {
    // In a real implementation, we would fetch the route path from DB
    // and use Google Maps Snap to Roads or Distance Matrix API
    try {
      // Example: Snap to roads to verify the driver is on a valid road
      const response = await axios.get(`https://roads.googleapis.com/v1/snapToRoads`, {
        params: {
          path: `${currentCoord[0]},${currentCoord[1]}`,
          interpolate: true,
          key: GOOGLE_MAPS_KEY
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Google Maps API Error:', error);
      throw new Error('Failed to verify route compliance');
    }
  },

  /**
   * Calculates distance between two points
   */
  async calculateDistance(origin: string, destination: string) {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
      params: {
        origins: origin,
        destinations: destination,
        key: GOOGLE_MAPS_KEY
      }
    });
    return response.data;
  }
};
