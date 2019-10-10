const FIND_BTN = '#findDestination'
const NEW_BTN = '#newBtn'
const IMG_WRAPPER = '.imgWrapper'
const SEARCH_RESULTS = '.searchResults'
const LANDING_PAGE = 'landingPage'
const DESTINATION_PAGE = 'destinationPage'
const RETURN_KEY_CODE = 13
const steps = {
  error: 0,
  landing: 1,
  destination: 2,
  searchAgain: 3
}

const getData = () => {
  $.ajax({
    type: "GET",
    url: 'https://www.thailandexplorer.org/public/locations.json',
    dataType: "json",
    success: (data) => {
      renderLayout({ step: steps.landing, locations: new Locations(data.locations) })
    }
  })
}

const getWikiDescriptionData = (props, callback) => {
  const WIKIVOYAGE_URL = `https://en.wikivoyage.org/w/api.php?action=query&format=json&prop=pageimages%7Cextracts&exlimit=1&generator=prefixsearch&redirects=1&formatversion=2&piprop=thumbnail&pithumbsize=250&pilimit=20&gpssearch=${props.location.name}&gpslimit=1`
  $.ajax({
    type: "GET",
    url: WIKIVOYAGE_URL,
    dataType: "jsonp",
    success: (data) => {
      props.data = data
      callback(props)
    }
  })
}

const initMap = (props) => {
  const map = new Maplace({
    map_div: '#gmap',
    type: 'marker',
    locations: [{
      lat: props.location.coordinates.lat,
      lon: props.location.coordinates.lng,
      html: props.destinationContent,
      icon: 'https://maps.google.com/mapfiles/markerA.png',
    }],
    map_options: {
      zoom: 5,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
  })

  map.Load()

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    console.log('mobile')
  } else {
    google.maps.event.addDomListener(window, 'resize', () => {
      map.oMap.setCenter(props.location.coordinates)
    })
  }
}

const setRandomImage = () => {
  const IMG_URL = "https://thailand-exp-images.s3-us-west-2.amazonaws.com/"
  const backgroundImages = [
    "riceLady.jpg",
    "raileyBeach.jpg",
    "monksTemple.jpg",
    "monkeys.jpg",
    "manChang.jpg",
    "maeYai.jpg",
    "girlsWater.jpg",
    "girlChang.jpg",
    "floatingMarket.jpg",
    "buddha.jpg",
    "boyBudah.jpg",
    "ancient.jpg",
    "thaiBackground.jpg",
    "Yipeng.jpg",
    "islands.jpg",
    "Loy_Krathong.jpg",
    "thaiBudah.jpg",
    "komloy.jpg"
  ]

  const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)]
  $('.landingPage').css('background-image', `url(${IMG_URL}${randomImage})`)
}

const landingPageLayout = `
<main class="main-content" role="main" aria-live="assertive">
	<section role="region">
		<div class="slogan" aria-describedby="info">
			<h1 class="appTitle">Thailand Explorer</h1>	
			<img class="logoImg" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/428394/chang.png">
			<p class="appDescription" >Explore random travel destinations in Thailand!</p>
			<a href="#" role="button" id="findDestination" class="findBtn">Find Adventure</a>
		</div>				
	</section>
</main>`

const destinationPageLayout = `
<header class="destinationHeader" role="banner">
	<a role="link" href="https://mikehaslam-thinkful-projects.github.io/thailand-explorer/"><img class="logoImg" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/428394/chang.png" alt="elephant image link to home page"></a>
	<h1 class="headerTitle">Thailand Explorer</h1>
	<a href="#" role="button" id="newBtn" class="newAdventureBtn">New Adventure!</a>
</header>
<main class="main-content" role="main" aria-live="assertive">
	<div id="gmap">
	
	
	</div>
</main>
`

const errorPageLayout = `
<main class="main-content" role="main" aria-live="assertive">
	<h2>Something went wrong!</h2>
	<p id="error"></p>
</main>
`
const setImage = (imgUrl) => {
  return `<div class="imgParent"><img class="destinationImg" src="${imgUrl}" alt"This is an image about a destination in Thailand"></img></div>`
}

const formatDescriptionString = (str) => {
  let newStr = str.substr(0, 400)
  newStr = newStr.substr(0, Math.min(newStr.length, newStr.lastIndexOf(' '))) + "&hellip;"
  return newStr
}

const setDescription = (location, description) => {
  const desc = $($.parseHTML(description)).closest('p').slice(0, 5).text().substr(0, 300)
  const descriptionString = formatDescriptionString(desc)
  return `<div class="descriptionParent">
			<p class="descriptionText">${descriptionString}</p>
			<a class="moreLink" target="_blank" href="https://en.wikivoyage.org/wiki/${location}">More information about ${location} from WikiVoyage &hellip;</a>
		</div>`
}

const setWikiData = (props) => {
  const images = props.data.query.pages.map((item, index) => {
    return setImage(item.hasOwnProperty("thumbnail") ? item.thumbnail.source : 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/428394/chang.png')
  })
  const locationPicked = props.data.query.pages[0].title
  const descriptionText = props.data.query.pages[0].extract

  props.destinationContent = `<section id="destinationContent" role="region" >
		<div class="imgWrapper">
           ${images[0]}
		</div>
		<div class="searchResults">
			${setDescription(locationPicked, descriptionText)}
		</div>	
	</section>`
  initMap(props)
}

const renderResults = (props) => {
  props.location = props.locations.getRandomLocation()
  getWikiDescriptionData(props, setWikiData)
  $(NEW_BTN).click(props, newButtonPressed)
  $(NEW_BTN).keypress(props, (event) => {
    if (event.which === RETURN_KEY_CODE) {
      newButtonPressed(event)
    }
  })
}


const findButtonPressed = (event) => {
  const props = event.data
  props.step = steps.destination
  $('.landingPage').css('background-image', '')
  renderLayout(props)

}

const newButtonPressed = (event) => {
  const props = event.data
  props.step = steps.searchAgain
  renderLayout(props)
}

const renderLanding = (props) => {
  setRandomImage()
  $(FIND_BTN).click(props, findButtonPressed)
  $(FIND_BTN).keypress(props, (event) => {
    if (event.which === RETURN_KEY_CODE) {
      findButtonPressed(event)

    }
  })


}

const renderError = (error) => {
  $("#error").html(`${error.message}!`)
}

const renderLayout = (props) => {
  $('body').removeClass()
  $(SEARCH_RESULTS).html('')
  let html = errorPageLayout
  let cssClass = LANDING_PAGE
  let callback = renderError

  switch (props.step) {
    case steps.landing:
      html = landingPageLayout
      cssClass = LANDING_PAGE
      callback = renderLanding
      break
    case steps.destination:
      html = destinationPageLayout
      cssClass = DESTINATION_PAGE
      callback = renderResults
      break
    case steps.searchAgain:
      html = destinationPageLayout
      cssClass = DESTINATION_PAGE
      callback = renderResults
      break
    default:
      break
  }

  $('body').html('').removeClass().addClass(cssClass).html(html)
  callback(props)

}

$(getData())








