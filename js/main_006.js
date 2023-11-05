//レイヤ設定
function setLayers() {
	//########## レイヤー設定 ##########
	// PLATEAU
	var hoveredStateId = null;
	var hovered_PLATEAU_Flg = false;
	map.addLayer({
	  'id': 'PLATEAU',
	  'source': 'PLATEAU',
	  'source-layer': 'PLATEAU_2020_LOD1fgb',
	  'minzoom': 15,
	  'maxzoom': 24,
	  'layout': {
	    'visibility': 'visible',
	  },
	  'type': 'fill-extrusion',
	  'paint': {
	    "fill-extrusion-color": [
	      'case',
	      ['boolean', ['feature-state', 'hover'], false],
	      '#0000ff',
	      '#aaa'
	    ],
	  'fill-extrusion-opacity': 0.7,
	  'fill-extrusion-height': ['get', 'bldg_measuredHeight']
	  }
	});

	// PLATEAU（ホバー効果）
	const hover_ID = 'PLATEAU';
	const sourceName = 'PLATEAU';
	const sourceLayerName = 'PLATEAU_2020_LOD1fgb';
	map.on('mousemove', hover_ID, function (e) {
	  if (e.features.length > 0) {
	    hovered_PLATEAU_Flg = true;	//PLATEAUホバーフラグ
	    map.getCanvas().style.cursor = 'pointer'
	    if (hoveredStateId) {
	      map.setFeatureState(
	        { source: sourceName, sourceLayer: sourceLayerName, id: hoveredStateId },
	        { hover: false }
	      );
	    }
	    hoveredStateId = e.features[0].id;
	    map.setFeatureState(
	      { source: sourceName, sourceLayer: sourceLayerName, id: hoveredStateId },
	      { hover: true }
	    );
	  }
	});

	map.on('mouseleave', hover_ID, function () {
	  if (hoveredStateId) {
	    hovered_PLATEAU_Flg = false;	//PLATEAUホバーフラグ
	    map.getCanvas().style.cursor = ''
	    map.setFeatureState(
	      { source: sourceName, sourceLayer: sourceLayerName, id: hoveredStateId },
	      { hover: false }
	    );
	  }
	  hoveredStateId = null;
	});

	//法務省地図【ライン】
	map.addLayer({
	  'id': 'MOJ_fude-line',
	  'type': 'line',
	  'source': 'MOJ_Map',
	  'source-layer': 'fude',
	  'paint': {
	  'line-color': '#ff0000',
	   },
	  'minzoom': 15,
	  'maxzoom': 24,
	});

};

//ジャンプ（現在地）
function getLocation(getLatLng) {
	map.flyTo({
	  center: [getLatLng.coords.longitude, getLatLng.coords.latitude], 
	  zoom: 17,
	  speed: 2.5,
	  curve: 1
	});

	// 3.0秒遅延して傾ける
	setTimeout(function(){
	  var easeOptions = {
	      pitch: 50,
	      duration: 1000,
	  };
	  map.easeTo(easeOptions);
	  setLayers();
	},3000);


};


// マップ設定
    const map = new maplibregl.Map({
	    container: 'map',
	    hash: true,
	    style: {
	      "version": 8,
	      "name": "Offce-Shirado.com",
	      "sprite": "https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite",
	      "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
	      "sources": {
	        // シームレス空中写真
	        GSI_seamlessphoto : {
	            type: 'raster',
	            tiles: [ 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg' ],
	            tileSize: 256,
	            attribution:"<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
	        }
	      },
	      "layers": [
	        {
	          // シームレス空中写真
	          id: 'GSI_seamlessphoto',
	          type: 'raster',
	          source: 'GSI_seamlessphoto',
	          minzoom: 0,
	          maxzoom: 24,
	        }
	      ]
	    },
	    center: [139.75417,36.50], // 日本全体
	    zoom: 4, // ズームレベル
	    minZoom: 4,
	    maxZoom: 23,
//	    pitch: 50,
	    maxPitch: 70,
    });


// ロードアクション
map.on('load', async function () {

	//PMTiles初期設定
	//PMTilesプラグインをMapLibre GL JSに入れる。
	let protocol = new pmtiles.Protocol();
        maplibregl.addProtocol("pmtiles",protocol.tile);

	//office-shirado.com
	let PMTILES_URL01 = "https://office-shirado.com/maps/Moj_Map/MojMap_2023.pmtiles";

	//【ベクトル】（ＰＬＡＴＡＵＥ）
	let PMTILES_URL02 = "https://office-shirado.com/maps/PLATEAU/PLATEAU_2020_LOD1.pmtiles";


        const PMTiles01 = new pmtiles.PMTiles(PMTILES_URL01)
        const PMTiles02 = new pmtiles.PMTiles(PMTILES_URL02)

        // this is so we share one instance across the JS code and the map renderer
        protocol.add(PMTiles01);
        protocol.add(PMTiles02);

        // 法務省地図
	map.addSource('MOJ_Map',{
		type: "vector",
		//office-shirado.comのMaps参照
                url: "pmtiles://" + PMTILES_URL01,
                attribution: '<a href="https://www.moj.go.jp/MINJI/minji05_00494.html" target="_blank">法務省地図</a>'
	});

        // ＰＬＡＴＥＡＵ
	map.addSource('PLATEAU',{
		type: "vector",
		//office-shirado.comのMaps参照
                url: "pmtiles://" + PMTILES_URL02,
                generateId: true,
                attribution:"<a href='https://github.com/shi-works/plateau-lod1-bldg-pmtiles/' target='_blank'>PLATEAU(Shi-works)</a>"
	});

        // 標高タイル（国土地理院）
	map.addSource("gsidem", {
	      type: 'raster-dem',
	      tiles: [
	          'https://optgeo.github.io/10b256/zxy/{z}/{x}/{y}.webp',
	      ],
	      attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html#dem" target="_blank">地理院タイル</a>',
	      tileSize: 256
	});

	// 現在地取得
	var ZoomLv = map.getZoom();
	//初期ズームレベルの時は、現在地ジャンプ
	if (ZoomLv == 4){

	// 0.5秒遅延してジャンプ
	  setTimeout(function(){
	    navigator.geolocation.getCurrentPosition(getLocation);
	  },500
	);
	}else{
	  setLayers();
	}

	// ３Ｄ表示（標高タイル）
	map.setTerrain({ 'source': 'gsidem', 'exaggeration': 1 });

});

//#################ロード時アクション#################



//#################マップコントロール（画面制御）#################
//ダブルクリックズーム制御（しない）
map.doubleClickZoom.disable();

//ドラッグ回転制御（する）
//map.dragRotate.disable();

//ピッチ回転制御（する）
//map.pitchWithRotate.disable();

//タッチズーム回転制御（する）
//map.touchZoomRotate.disableRotation();

//#################マップコントロール（画面制御）#################

//#################マップコントロール（ツール）#################
//ジオコーダー（国土地理院）
var geocoder_api = {
	forwardGeocode: async (config) => {
		const features = [];

		const Text_Prefix = config.query.substr(0, 3);

		try {
		  let request ='https://msearch.gsi.go.jp/address-search/AddressSearch?q=' +config.query;
			const response = await fetch(request);
			const geojson = await response.json();

		  for (var i = 0; i < geojson.length; i++) {
			if (geojson[i].properties.title.indexOf(Text_Prefix) !== -1){
			  let point = {
				  type: 'Feature',
				  geometry: {
				  type: 'Point',
				  coordinates: geojson[i].geometry.coordinates
			  	  },
			  place_name: geojson[i].properties.title,
			  properties: geojson[i].properties,
			  text: geojson[i].properties.title,
			  place_type: ['place'],
			  center: geojson[i].geometry.coordinates
			  };
			  features.push(point);
			}
		 }
		} catch (e) {
			console.error(`Failed to forwardGeocode with error: ${e}`);
		}

		return {
			features: features
		};
	}
};
map.addControl(new MaplibreGeocoder(geocoder_api, {maplibregl: maplibregl}));


// 現在位置表示
map.addControl(new maplibregl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    fitBoundsOptions: { maxZoom: 20 },
    trackUserLocation: true,
    showUserLocation: true
    }), 
    'top-right');

// マップコントロール（拡大・縮小・方位）
map.addControl(new maplibregl.NavigationControl(), 'top-right');


//#################マップコントロール（ツール）#################

