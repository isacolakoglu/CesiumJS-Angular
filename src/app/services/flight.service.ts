import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { flightData } from "../models/flightdata.model"

@Injectable({
  providedIn: 'root'
})
export class FlightService {


  private url = "http://localhost:3000/Data";

  constructor(private http: HttpClient) { }

  getConfig() {
    return this.http.get<flightData[]>(this.url)
  }
}
