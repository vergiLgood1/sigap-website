// import mapboxgl from 'mapbox-gl';

// interface AnimationOptions {
//     duration: number;
//     easing: string;
//     transform: string;
// }

// interface CustomPopupOptions extends mapboxgl.PopupOptions {
//     openingAnimation?: AnimationOptions;
//     closingAnimation?: AnimationOptions;
// }

// // Extend the native Mapbox Popup
// export class CustomAnimatedPopup extends mapboxgl.Popup {
//     private openingAnimation: AnimationOptions;
//     private closingAnimation: AnimationOptions;
//     private animating = false;

//     constructor(options: CustomPopupOptions = {}) {
//         // Extract animation options and pass the rest to the parent class
//         const {
//             openingAnimation,
//             closingAnimation,
//             className,
//             ...mapboxOptions
//         } = options;

//         // Add our custom class to the className
//         const customClassName = `custom-animated-popup ${className || ''}`.trim();

//         // Call the parent constructor
//         super({
//             ...mapboxOptions,
//             className: customClassName,
//         });

//         // Store animation options
//         this.openingAnimation = openingAnimation || {
//             duration: 300,
//             easing: 'ease-out',
//             transform: 'scale'
//         };

//         this.closingAnimation = closingAnimation || {
//             duration: 200,
//             easing: 'ease-in-out',
//             transform: 'scale'
//         };

//         // Override the parent's add method
//         const parentAdd = this.addTo;
//         this.addTo = (map: mapboxgl.Map) => {
//             // Call the parent method first
//             parentAdd.call(this, map);

//             // Apply animation after a short delay to ensure the element is in the DOM
//             setTimeout(() => this.animateOpen(), 10);

//             return this;
//         };
//     }

//     // Override the remove method to add animation
//     remove(): this {
//         if (this.animating) {
//             return this;
//         }

//         this.animateClose(() => {
//             super.remove();
//         });

//         return this;
//     }

//     // Animation methods
//     private animateOpen(): void {
//         const container = this._container;
//         if (!container) return;

//         // Apply initial state
//         container.style.opacity = '0';
//         container.style.transform = 'scale(0.8)';
//         container.style.transition = `
//       opacity ${this.openingAnimation.duration}ms ${this.openingAnimation.easing}, 
//       transform ${this.openingAnimation.duration}ms ${this.openingAnimation.easing}
//     `;

//         // Force reflow
//         void container.offsetHeight;

//         // Apply final state to trigger animation
//         container.style.opacity = '1';
//         container.style.transform = 'scale(1)';
//     }

//     private animateClose(callback: () => void): void {
//         const container = this._container;
//         if (!container) {
//             callback();
//             return;
//         }

//         this.animating = true;

//         // Setup transition
//         container.style.transition = `
//       opacity ${this.closingAnimation.duration}ms ${this.closingAnimation.easing}, 
//       transform ${this.closingAnimation.duration}ms ${this.closingAnimation.easing}
//     `;

//         // Apply closing animation
//         container.style.opacity = '0';
//         container.style.transform = 'scale(0.8)';

//         // Execute callback after animation completes
//         setTimeout(() => {
//             this.animating = false;
//             callback();
//         }, this.closingAnimation.duration);
//     }

//     // Add method to create expanding wave circles
//     addWaveCircles(map: mapboxgl.Map, lngLat: mapboxgl.LngLat, options: {
//         color?: string,
//         maxRadius?: number,
//         duration?: number,
//         count?: number,
//         showCenter?: boolean
//     } = {}): void {
//         const {
//             color = 'red',
//             maxRadius = 80, // Reduce max radius for less "over" effect
//             duration = 2000, // Faster animation
//             count = 2, // Fewer circles
//             showCenter = true
//         } = options;

//         const sourceId = `wave-circles-${Math.random().toString(36).substring(2, 9)}`;

//         if (!map.getSource(sourceId)) {
//             map.addSource(sourceId, {
//                 type: 'geojson',
//                 data: {
//                     type: 'FeatureCollection',
//                     features: [{
//                         type: 'Feature',
//                         geometry: {
//                             type: 'Point',
//                             coordinates: [lngLat.lng, lngLat.lat]
//                         },
//                         properties: {
//                             radius: 0
//                         }
//                     }]
//                 }
//             });

//             for (let i = 0; i < count; i++) {
//                 const layerId = `${sourceId}-layer-${i}`;
//                 const delay = i * (duration / count);

//                 map.addLayer({
//                     id: layerId,
//                     type: 'circle',
//                     source: sourceId,
//                     paint: {
//                         'circle-radius': ['interpolate', ['linear'], ['get', 'radius'], 0, 0, 100, maxRadius],
//                         'circle-color': 'transparent',
//                         'circle-opacity': ['interpolate', ['linear'], ['get', 'radius'],
//                             0, showCenter ? 0.15 : 0, // Lower opacity
//                             100, 0
//                         ],
//                         'circle-stroke-width': 1.5, // Thinner stroke
//                         'circle-stroke-color': color
//                     }
//                 });

//                 this.animateWaveCircle(map, sourceId, layerId, duration, delay);
//             }
//         }
//     }

//     private animateWaveCircle(
//         map: mapboxgl.Map,
//         sourceId: string,
//         layerId: string,
//         duration: number,
//         delay: number
//     ): void {
//         let start: number | null = null;
//         let animationId: number;

//         const animate = (timestamp: number) => {
//             if (!start) {
//                 start = timestamp + delay;
//             }

//             const progress = Math.max(0, timestamp - start);
//             const progressPercent = Math.min(progress / duration, 1);

//             if (map.getSource(sourceId)) {
//                 (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
//                     type: 'FeatureCollection',
//                     features: [{
//                         type: 'Feature',
//                         geometry: {
//                             type: 'Point',
//                             coordinates: (map.getSource(sourceId) as any)._data.features[0].geometry.coordinates
//                         },
//                         properties: {
//                             radius: progressPercent * 100
//                         }
//                     }]
//                 });
//             }

//             if (progressPercent < 1) {
//                 animationId = requestAnimationFrame(animate);
//             } else if (map.getLayer(layerId)) {
//                 // Restart the animation for continuous effect
//                 start = null;
//                 animationId = requestAnimationFrame(animate);
//             }
//         };

//         // Start the animation after delay
//         setTimeout(() => {
//             animationId = requestAnimationFrame(animate);
//         }, delay);

//         // Clean up on popup close
//         this.once('close', () => {
//             cancelAnimationFrame(animationId);
//             if (map.getLayer(layerId)) {
//                 map.removeLayer(layerId);
//             }
//             if (map.getSource(sourceId) && !map.getLayer(layerId)) {
//                 map.removeSource(sourceId);
//             }
//         });
//     }
// }

// // Add styles to document when in browser environment
// if (typeof document !== 'undefined') {
//     // Add styles only if they don't exist yet
//     if (!document.getElementById('custom-animated-popup-styles')) {
//         const style = document.createElement('style');
//         style.id = 'custom-animated-popup-styles';
//         style.textContent = `
//       .custom-animated-popup {
//         will-change: transform, opacity;
//       }
//       .custom-animated-popup .mapboxgl-popup-content {
//         overflow: hidden;
//       }
      
//       /* Marker styles with wave circles */
//       .marker-gempa {
//         position: relative;
//         width: 30px;
//         height: 30px;
//         cursor: pointer;
//       }
      
//       .circles {
//         position: relative;
//         width: 100%;
//         height: 100%;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//       }
      
//       .circle1, .circle2, .circle3 {
//         position: absolute;
//         border-radius: 50%;
//         border: 2px solid red;
//         width: 100%;
//         height: 100%;
//         opacity: 0;
//         animation: pulse 2s infinite;
//       }
      
//       .circle2 {
//         animation-delay: 0.5s;
//       }
      
//       .circle3 {
//         animation-delay: 1s;
//       }
      
//       @keyframes pulse {
//         0% {
//           transform: scale(0.5);
//           opacity: 0;
//         }
//         50% {
//           opacity: 0.8;
//         }
//         100% {
//           transform: scale(1.5);
//           opacity: 0;
//         }
//       }
      
//       .blink {
//         animation: blink 1s infinite;
//         color: red;
//         font-size: 20px;
//       }
      
//       @keyframes blink {
//         0% { opacity: 1; }
//         50% { opacity: 0.3; }
//         100% { opacity: 1; }
//       }
//     `;
//         document.head.appendChild(style);
//     }
// }
