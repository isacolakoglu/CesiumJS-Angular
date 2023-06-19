import { Directive, ElementRef, OnInit } from '@angular/core';
import { Viewer, Ion, createWorldTerrain, createOsmBuildings, Cartesian3, Color, TimeIntervalCollection, PositionProperty, PathGraphics, SampledPositionProperty, JulianDate, TimeInterval, IonResource, VelocityOrientationProperty, Camera } from 'cesium';
import { FlightService } from './services/flight.service';
import { flightData } from './models/flightdata.model';

@Directive({
  selector: '[appCesium]',
  providers: [FlightService]
})
export class CesiumDirective implements OnInit {
  datas: flightData[] | any;
  constructor(
    private el: ElementRef,
    private flightService: FlightService) { }
  ngOnInit(): void {
    this.getFlightData();
    //const viewer = new Viewer(this.el.nativeElement);
  };
  getFlightData() {
    // This is the default access token from your ion account
    Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTA4NzgwNS03OTc2LTRhNjQtYTI2Yi0yMjJmMTg2YWNlZWEiLCJpZCI6MTQ2MjY2LCJpYXQiOjE2ODY3NDQ1MjJ9.WbSNnZK9_ogI_06JySyLFqjs7rb6wPojU_h6R1y_L4s";
    
    // Keep your `Cesium.Ion.defaultAccessToken = 'your_token_here'` line from before here. 
    const viewer = new Viewer(this.el.nativeElement, {
      //terrainProvider: createWorldTerrain()
      terrainProvider: createWorldTerrain()
    });
    const osmBuildings = viewer.scene.primitives.add(createOsmBuildings());

    // The SampledPositionedProperty stores the position and timestamp for each sample along the radar sample series.
    const positionProperty = new SampledPositionProperty();
    this.flightService.getConfig().subscribe((data: flightData[]) => {
      this.datas = data
      console.log(this.datas, 'DATAS')
      for (let i = 0; i < data.length; i++) {
        const dataPoint = data.slice(75,150)[i];

        const timeStepInSeconds = 30;
        const totalSeconds = timeStepInSeconds * (this.datas.length - 1);
        const start = JulianDate.fromIso8601("2020-03-09T23:10:00Z");
        const stop = JulianDate.addSeconds(start, totalSeconds, new JulianDate());
        viewer.clock.startTime = start.clone();
        viewer.clock.stopTime = stop.clone();
        viewer.clock.currentTime = start.clone();
        viewer.timeline.zoomTo(start, stop);
        // Speed up the playback speed 50x.
        viewer.clock.multiplier = 10;
        // Start playing the scene.
        viewer.clock.shouldAnimate = false;

        // Declare the time for this individual sample and store it in a new JulianDate instance.
        const time = JulianDate.addSeconds(start, i * timeStepInSeconds, new JulianDate());
        const position = Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);
        // Store the position along with its timestamp. 
        // Here we add the positions all upfront, but these can be added at run-time as samples are received from a server.
        positionProperty.addSample(time, position);

        viewer.entities.add({
          description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
          position: Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height),
          point: { pixelSize: 10, color: Color.RED }
          
        });

       

        async function loadModel(){
          // Load the glTF model from Cesium ion.
          const airplaneUri = await IonResource.fromAssetId(1838144);
          const airplaneEntity = viewer.entities.add({
            availability: new TimeIntervalCollection([new TimeInterval({ start: start, stop: stop })]),
            position: positionProperty,
            // Attach the 3D model instead of the green point.
            model: { uri: airplaneUri },
            // Automatically compute the orientation from the position.
            orientation: new VelocityOrientationProperty(positionProperty),
            path: new PathGraphics({ width: 3 })
          });

          viewer.trackedEntity = airplaneEntity;
        }
        loadModel();
      }
    })
  }
}