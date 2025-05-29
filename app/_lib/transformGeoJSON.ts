// import { FeatureCollection, Feature } from 'geojson';
// import { DistrictCrimeData } from '../_components/map/layers/district-layer';

// /**
//  * Transforms district GeoJSON data with crime statistics
//  */
// export function transformDistrictGeoJSON(
//   baseGeoJSON: FeatureCollection,
//   crimeData: DistrictCrimeData[] = []
// ): FeatureCollection {
//   // Create a typed GeoJSON object
//   const typedGeoJson = {
//     ...baseGeoJSON,
//     type: 'FeatureCollection' as const,
//   } as FeatureCollection;

//   // If no crime data, return the base GeoJSON
//   if (!crimeData.length) {
//     return typedGeoJson;
//   }

//   // Transform features with crime data
//   return {
//     ...typedGeoJson,
//     features: typedGeoJson.features.map((feature) => {
//       const districtId = feature.properties?.kode_kec;
//       const matchingData = crimeData.find((d) => d.district_id === districtId);

//       if (matchingData) {
//         return {
//           ...feature,
//           properties: {
//             ...feature.properties,
//             number_of_unemployed: matchingData.demographics.map(
//               (demo) => demo.number_of_unemployed
//             ),
//             population: matchingData.demographics.map(
//               (demo) => demo.population
//             ),
//             population_density: matchingData.demographics.map(
//               (demo) => demo.population_density
//             ),
//             number_of_crime: matchingData.number_of_crime,
//             score: matchingData.score,
//             level: matchingData.level,
//             address: matchingData.geographics.map((geo) => geo.address),
//             land_area: matchingData.geographics.map((geo) => geo.land_area),
//             latitude: matchingData.incidents.map(
//               (incident) => incident.latitude
//             ),
//             longitude: matchingData.incidents.map(
//               (incident) => incident.latitude
//             ),
//           },
//         };
//       }
//       return feature;
//     }),
//   };
// }
