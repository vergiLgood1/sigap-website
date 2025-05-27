"use client"

import { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { IIncidentLog, EWSStatus } from '@/app/_utils/types/ews';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, X } from 'lucide-react';

import DigitalClock from '../markers/digital-clock';
import { Badge } from '@/app/_components/ui/badge';
import { Button } from '@/app/_components/ui/button';
import { IconCancel } from '@tabler/icons-react';


interface EWSAlertLayerProps {
    map: mapboxgl.Map | null;
    incidents?: IIncidentLog[];
    onIncidentResolved?: (id: string) => void;
    visible?: boolean;
}

export default function EWSAlertLayer({
    map,
    incidents = [],
    onIncidentResolved,
    visible = true
}: EWSAlertLayerProps) {
    const [ewsStatus, setEwsStatus] = useState<EWSStatus>('idle');
    const [activeIncidents, setActiveIncidents] = useState<IIncidentLog[]>([]);
    const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
    const animationFrameRef = useRef<number | null>(null);
    const alertAudioRef = useRef<HTMLAudioElement | null>(null);
    const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
    const warningAudioRef = useRef<HTMLAudioElement | null>(null);
    const pulsingDotsRef = useRef<Record<string, HTMLDivElement>>({}); // For animation reference
    const sireneAudioRef = useRef<HTMLAudioElement | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [currentAlert, setCurrentAlert] = useState<IIncidentLog | null>(null);

    // Initialize audio
    useEffect(() => {
        try {
            // Initialize different audio elements for different purposes
            // alertAudioRef.current = new Audio("/sounds/error-2-126514.mp3");
            // notificationAudioRef.current = new Audio("/sounds/system-notification-199277.mp3");
            // warningAudioRef.current = new Audio("/sounds/error-call-to-attention-129258.mp3");
            sireneAudioRef.current = new Audio("/sounds/security-alarm-80493.mp3");

            // Configure audio elements
            [alertAudioRef, notificationAudioRef, warningAudioRef].forEach(audioRef => {
                if (audioRef.current) {
                    audioRef.current.volume = 0.5;
                    audioRef.current.load();
                }
            });

            // Loop handling for main alert
            let loopStartTime: number | null = null;
            if (alertAudioRef.current) {
                alertAudioRef.current.addEventListener('ended', () => {
                    // Initialize start time on first play
                    if (loopStartTime === null) {
                        loopStartTime = Date.now();
                    }

                    // Check if 1 minute has passed
                    if (Date.now() - loopStartTime < 60000) { // 60000ms = 1 minute
                        alertAudioRef.current?.play().catch(err =>
                            console.error("Error playing looped alert sound:", err));
                    } else {
                        loopStartTime = null; // Reset for future alerts
                    }
                });
            }
        } catch (err) {
            console.error("Could not initialize alert audio:", err);
        }

        return () => {
            // Cleanup all audio elements
            [alertAudioRef, notificationAudioRef, warningAudioRef].forEach(audioRef => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }
            });
        };
    }, []);

    // Update active incidents when incidents prop changes
    useEffect(() => {
        const newActiveIncidents = incidents.filter(inc => inc.status === 'active');
        setActiveIncidents(newActiveIncidents);

        // Update EWS status and trigger alert display
        if (newActiveIncidents.length > 0) {
            setEwsStatus('alert');

            // Play notification sound first
            if (notificationAudioRef.current) {
                notificationAudioRef.current.play()
                    .catch(err => console.error("Error playing notification sound:", err));
            }

            // Set the most recent incident as current alert
            const newestIncident = newActiveIncidents[newActiveIncidents.length - 1];
            setCurrentAlert(newestIncident);
            setShowAlert(true);

            // Play warning sound after a delay
            // setTimeout(() => {
            //     if (warningAudioRef.current) {
            //         warningAudioRef.current.play()
            //             .catch(err => console.error("Error playing warning sound:", err));
            //     }
            // }, 1000);

            // Auto-close the alert after 15 seconds
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
        } else {
            setEwsStatus('idle');
            setShowAlert(false);
            setCurrentAlert(null);
        }
    }, [incidents]);

    // Handle marker creation, animation, and cleanup
    useEffect(() => {
        if (!map || !visible) return;

        // Clear any existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current.clear();
        pulsingDotsRef.current = {};

        // Cancel any ongoing animations
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Create new markers for all active incidents
        activeIncidents.forEach(incident => {
            // Don't add if marker already exists
            if (markersRef.current.has(incident.id)) return;

            const { latitude, longitude } = incident.location;

            // Create marker element with animated circles (similar to TitikGempa)
            const el = document.createElement('div');
            el.className = 'ews-alert-marker';

            // Create the content for the marker
            const contentElement = document.createElement('div');
            contentElement.className = 'marker-gempa';

            // Use React for the marker content with animated circles
            const markerRoot = createRoot(contentElement);
            markerRoot.render(
                <div className=" flex justify-center items-center">
                    <div className="circle1"></div>
                    <div className="circle2"></div>
                    <div className="circle3"></div>
                    <IconCancel className="blink" />
                </div>
            );

            // Add the content element to the marker
            el.appendChild(contentElement);

            // Create and add the marker
            const marker = new mapboxgl.Marker({
                element: el,
                anchor: 'center'
            })
                .setLngLat([longitude, latitude])
                .addTo(map);

            // Create the popup content
            const popupElement = document.createElement('div');
            const popupRoot = createRoot(popupElement);

            popupRoot.render(
                <div className="relative">
                    <div className="w-full overflow-hidden">
                        <div className="strip-wrapper">
                            <div className="strip-bar loop-strip-reverse anim-duration-20"></div>
                            <div className="strip-bar loop-strip-reverse anim-duration-20"></div>
                        </div>
                        <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center">
                            <p className="p-1 bg-black font-bold text-xs text-glow uppercase">
                                {incident.priority} PRIORITY
                            </p>
                        </div>
                    </div>

                    <div className="relative z-40 bg-red-600 text-white p-2 rounded-lg shadow-lg min-w-[200px] max-w-[300px]">
                        <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className={`
                                ${incident.priority === 'high' ? 'bg-red-700 text-white' :
                                    incident.priority === 'medium' ? 'bg-amber-600 text-white' :
                                        'bg-blue-600 text-white'}
                            `}>
                                {incident.priority.toUpperCase()} PRIORITY
                            </Badge>
                            <div className="text-xs">
                                <DigitalClock
                                    timeZone="Asia/Jakarta"
                                    format="24h"
                                    showSeconds={true}
                                    className="font-mono bg-black/50 px-1 rounded text-red-300"
                                />
                            </div>
                        </div>

                        <h3 className="font-bold flex items-center gap-1 text-glow">
                            <AlertTriangle className="h-4 w-4" />
                            {incident.category || "Emergency Alert"}
                        </h3>

                        <div className="text-sm mt-1">
                            <p className="font-bold">{incident.location.district}</p>
                            <p className="text-xs">{incident.location.address}</p>
                            <p className="text-xs mt-1">Reported by: {incident.reporter.name}</p>
                            <p className="text-xs mt-1 font-mono text-red-300">Auto-closing in 10s</p>
                        </div>

                        <div className="flex justify-between mt-2">
                            <Badge variant="secondary" className="bg-red-800 text-white">
                                ID: {incident.id}
                            </Badge>
                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-700 text-white border-0 hover:bg-green-600 h-6 text-xs px-2"
                                onClick={() => onIncidentResolved?.(incident.id)}
                            >
                                Respond
                            </Button>
                        </div>
                    </div>
                </div>
            );

            // Create and attach the animated popup
            // const popup = new CustomAnimatedPopup({
            //     closeOnClick: false,
            //     openingAnimation: {
            //         duration: 300,
            //         easing: 'ease-out',
            //         transform: 'scale'
            //     },
            //     closingAnimation: {
            //         duration: 200,
            //         easing: 'ease-in-out',
            //         transform: 'scale'
            //     }
            // }).setDOMContent(popupElement);

            // marker.setPopup(popup);
            // markersRef.current.set(incident.id, marker);

            // // Add wave circles around the incident point
            // if (map) {
            //     popup.addWaveCircles(map, new mapboxgl.LngLat(longitude, latitude), {
            //         color: incident.priority === 'high' ? '#ff0000' :
            //             incident.priority === 'medium' ? '#ff9900' : '#0066ff',
            //         maxRadius: 300,
            //         count: 4
            //     });
            // }

            // Fly to the incident if it's new
            const isNewIncident = activeIncidents.length > 0 &&
                incident.id === activeIncidents[activeIncidents.length - 1].id;

            if (isNewIncident) {
                // Dispatch custom flyTo event
                const flyToEvent = new CustomEvent('mapbox_fly_to', {
                    detail: {
                        longitude,
                        latitude,
                        zoom: 15,
                        bearing: 0,
                        pitch: 60,
                        duration: 2000
                    }
                });

                map.getContainer().dispatchEvent(flyToEvent);

                // Auto-open popup for the newest incident
                // setTimeout(() => {
                //     popup.addTo(map);
                // }, 2000);
            }
        });

        // Cleanup function
        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            markersRef.current.forEach(marker => marker.remove());
            markersRef.current.clear();
        };
    }, [map, activeIncidents, visible, onIncidentResolved]);

    // Create a floating EWS status indicator when in alert mode
    useEffect(() => {
        if (!map || ewsStatus === 'idle') return;

        // Create status indicator element if it doesn't exist
        let statusContainer = document.getElementById('ews-status-indicator');

        // Cleanup function
        return () => {
            if (statusContainer && statusContainer.parentNode) {
                statusContainer.parentNode.removeChild(statusContainer);
            }
        };
    }, [map, ewsStatus, activeIncidents.length]);

    // Render the full-screen alert overlay when a new incident is detected
    return (
        <>
            {showAlert && currentAlert && (
                <div className='absolute m-auto top-0 bottom-0 left-0 right-0 flex flex-col justify-center items-center'>
                    <div className='fixed m-auto top-0 bottom-0 left-0 right-0 flex flex-col justify-center items-center overlay-bg'></div>
                    <div className='warning scale-75 md:scale-150 flex flex-col justify-center items-center'>
                        <div className='long-hex flex flex-col justify-center opacity-0 show-pop-up animation-delay-1'>
                            <div className="flex justify-evenly w-full items-center">
                                <div className='warning-black opacity-0 blink animation-fast animation-delay-2'></div>
                                <div className='flex flex-col font-bold text-center text-black'>
                                    <span className='text-xl'>PERINGATAN</span>
                                    <span className='text-xs'>{currentAlert.category || "Emergency Alert"}</span>
                                </div>
                                <div className='warning-black opacity-0 blink animation-fast animation-delay-2'></div>
                            </div>
                        </div>
                        <div className="w-full flex justify-between">
                            <div className="warning-black-hex -mt-20 show-pop-up"></div>
                            <div className="warning-black-hex -mt-20 show-pop-up"></div>
                        </div>
                        <div className="w-full flex justify-center info">
                            <div className="basic-hex -mt-12 -mr-2 opacity-0 show-pop-up flex flex-col justify-center items-center text-glow">
                                <p className='text-xl'>{currentAlert.priority}</p>
                                <p style={{
                                    fontSize: '10px',
                                }}>PRIORITY</p>
                            </div>
                            <div className="basic-hex opacity-0 show-pop-up"></div>
                            <div className="basic-hex -mt-12 -ml-2 opacity-0 show-pop-up flex flex-col justify-center items-center text-glow">
                                <p className='text-xl'>{currentAlert.location.district}</p>
                                <p style={{
                                    fontSize: '10px',
                                }}>LOCATION</p>
                            </div>
                        </div>
                        <div className="w-full flex justify-between show-pop-up">
                            <div className="warning-yellow -mt-24 ml-6 opacity-0 blink animation-delay-2"></div>
                            <div className="warning-yellow -mt-24 mr-6 opacity-0 blink animation-delay-2"></div>
                        </div>
                    </div>
                    <div className='strip top-0'>
                        <div className='strip-wrapper'><div className='strip-bar loop-strip-reverse'></div><div className='strip-bar loop-strip-reverse'></div>
                        </div>
                    </div>
                    <div className='strip bottom-0'>
                        <div className='strip-wrapper'><div className='strip-bar loop-strip'></div><div className='strip-bar loop-strip'></div>
                        </div>
                    </div>
                    <Button
                        className="absolute top-4 right-4 bg-transparent border border-white hover:bg-red-800"
                        onClick={() => setShowAlert(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </>
    );
}
