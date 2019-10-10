class Location {
  constructor(location) {
    this.coordinates = {
      lat: location.lat,
      lng: location.lng
    }
    this.name = location.name

  }
}

class Locations {
  constructor(locations) {
    this.locations = locations.map((location, index) => {
      return new Location(location)
    })
  }

  getRandomLocation() {
    return this.locations[Math.floor(Math.random() * this.locations.length)]
  }
}

