// "use client";

// import { useState, useEffect } from 'react';
// import mapboxgl from 'mapbox-gl';
// import EWSAlertLayer from '../layers/ews-alert-layer';

// import { IIncidentLog } from '@/app/_utils/types/ews';

// interface AlertLayerContainerProps {
//     map: mapboxgl.Map | null;
//     activeLayer: string;
//     incidents: IIncidentLog[];
//     onIncidentResolved?: (id: string) => void;
// }

// export default function AlertLayerContainer({
//     map,
//     activeLayer,
//     incidents,
//     onIncidentResolved,
// }: AlertLayerContainerProps) {
//     const [ewsVisible, setEwsVisible] = useState(false);

//     // Determine which layers to show based on activeLayer
//     useEffect(() => {
//         const isAlertLayer = activeLayer === 'alerts';
//         setEwsVisible(isAlertLayer);
//     }, [activeLayer]);


//     return (
//         <>
//             {/* EWS Alert Layer for emergency notifications */}
//             <EWSAlertLayer
//                 map={map}
//                 incidents={incidents}
//                 onIncidentResolved={onIncidentResolved}
//                 visible={ewsVisible}
//             />
//         </>
//     );
// }
