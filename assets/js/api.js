const apikey = 'fb1edf8562680d21e4a6f7cb83c8847b';
// const currentweather = `https://api.openweathermap.org/data/2.5/weather?lat=23.7644025&lon=90.389015&units=metric&appid=fb1edf8562680d21e4a6f7cb83c8847b`;
// const forecast=`https://api.openweathermap.org/data/2.5/forecast?lat=40.7127281&lon=-74.0060152&units=metric&appid=fb1edf8562680d21e4a6f7cb83c8847b`
// const airpollution=`https://api.openweathermap.org/data/2.5/air_pollution?lat=23.251314&lon=90.851784&units=metric&appid=fb1edf8562680d21e4a6f7cb83c8847b`
// const geocoding-reverse=`http://api.openweathermap.org/geo/1.0/reverse?lat=23.7644025&lon=90.389015&limit=5&appid=fb1edf8562680d21e4a6f7cb83c8847b`
//const geocoding=`http://api.openweathermap.org/geo/1.0/direct?q=london&limit=5&appid=fb1edf8562680d21e4a6f7cb83c8847b`
// fetch(apiurl)
//     .then(response => response.json()) 
//     .then(data => {
//         console.log(data); 
//     })
    // Weather forecast

document.getElementById('search-button').addEventListener('click',()=>{
    const city=document.getElementById('city-input').value;
    if(city){
        getweatherdata(city)
    }
})

async function getweatherdata(city){
const apikey='fb1edf8562680d21e4a6f7cb83c8847b'
const geocodingurl=`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apikey}`

try{
    const georesponse= await fetch(geocodingurl)
    const geodata=await georesponse.json();
    if(geodata.length>0){
        const{lat, lon}=geodata[0]
        console.log(lat)
        console.log(lon)
        const weatherurl=`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apikey}`
        const forecasturl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apikey}`
        const airpollution=`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apikey}`
        const [weatherresponse, forecastresponse, airpollutionres]=await Promise.all([
            fetch(weatherurl),
            fetch(forecasturl),
            fetch(airpollution)
        ])
        const weatherdata = await weatherresponse.json()
        const forecastdata = await forecastresponse.json()
        const airpolldata= await airpollutionres.json()
        updateui(weatherdata,forecastdata,airpolldata)
    }else{
        alert('city not found')
    }

}catch(error){
    console.log('error fetching data:',error);
}
}
function updateCurrentDate() {
    const currentDateElement = document.querySelector('.current-date');
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString(undefined, options);
    currentDateElement.textContent = `${formattedDate}`;
}
updateCurrentDate();

function updateui(weatherdata,forecastdata,airpolldata){
    // Update current weather
    console.log(weatherdata)
    console.log(forecastdata)
    console.log(airpolldata)
    document.querySelector('.text-7xl').innerHTML=`${weatherdata.main.temp}<sup>o<sub>c</sub></sup>`
    document.querySelector('.fa-cloud').className=`fa-solid ${getweathericon(weatherdata.weather[0].icon)} fa-2x`
    document.querySelector('.weatherdes').textContent=weatherdata.weather[0].description;
    
    document.querySelector('.city').textContent = weatherdata?.name;

    // Update air quality
    const airquality=airpolldata.list[0].main.aqi;
    document.querySelector('.bg-lime-300.text-black.px-6.rounded-3xl').textContent=airqualitydes(airquality)
    // Update other details like PM2.5, SO2, NO2, and O3
    document.querySelector('.pm').textContent=airpolldata.list[0].components.pm2_5;
    document.querySelector('.so2').textContent=airpolldata.list[0].components.so2;
    document.querySelector('.no2').textContent=airpolldata.list[0].components.no2;
    document.querySelector('.o3').textContent=airpolldata.list[0].components.o3;
     // Update sunrise and sunset
     const options={hour: 'numeric', minute: '2-digit', hour12: true}
     const sunrise=new Date(weatherdata.sys.sunrise*1000).toLocaleTimeString([],options)
     const sunset=new Date(weatherdata.sys.sunset*1000).toLocaleTimeString([],options)

     document.querySelector('.rise').textContent=sunrise;
     document.querySelector('.set').textContent=sunset;
     // Update humidity, pressure, visibility, and feels like
     document.querySelector('.humidity').innerHTML=`${weatherdata.main.humidity}%`
     document.querySelector('.pressure').innerHTML=`${weatherdata.main.pressure}<sub>hpa</sub>`
     document.querySelector('.visibility').innerHTML=`${weatherdata.visibility/1000}<sub>km</sub>`
     document.querySelector('.feels').innerHTML=`${weatherdata.main.feels_like}<sup>o<sub>c</sub></sup>`
     updateforecast(forecastdata);
     updatehourlydata(forecastdata)
    
}
function updateforecast(forecastdata) {
    const dailyData = getdailydata(forecastdata);

    dailyData.forEach((day, index) => {
        const dayElement = document.querySelector(`#day-${index + 1}`);
        dayElement.innerHTML = `
            <div class="flex gap-2">
                <i class="fa-solid ${getweathericon(day.icon)} fa-3x"></i>
                <p class="text-5xl">${day.temp}<sup>o</sup></p>
            </div>
            <p>${day.date}</p>
            <p>${day.day}</p>
        `;
    });
}
function updatehourlydata(forecastdata){
    const hourlydata=forecastdata.list.slice(0,16);
    const startHour = 3;
    const hourIncrement = 3;
    hourlydata.slice(0,8).forEach((hour,index)=>{
        const date = new Date(hour.dt * 1000);
        const hours = (startHour + index * hourIncrement) % 24;
        const displayhour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const period = hours < 12 ? 'AM' : 'PM';
        const time = `${displayhour} ${period}`;
        document.querySelector(`#hourly-row-1`).innerHTML+=`<div class="flex flex-col items-center gap-5 alpha-4 py-5 w-[130px] h-[125px]">
        <p>${time}</p>
        <i class="fa-solid ${getweathericon(hour.weather[0].icon)} fa-2x"></i>
        <p>${hour.main.temp}<sup>o</sup></p>
        </div>`
    })
    hourlydata.slice(8, 16).forEach((hour, index) => {
        const date = new Date(hour.dt * 1000);
        const hours = (startHour + index * hourIncrement) % 24;
        const displayhour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const period = hours < 12 ? 'AM' : 'PM';
        const time = `${displayhour}${period}`;
        document.querySelector(`#hourly-row-2`).innerHTML += `
            <div class="flex flex-col items-center gap-5 alpha-4 py-5 w-[130px] h-[125px]">
                <p>${time}</p>
                <i class="fa-solid ${getweathericon(hour.weather[0].icon)} fa-2x"></i>
                <p>${hour.main.temp}<sup>o</sup></p>
            </div>
        `;
    });
}
function getdailydata(forecastdata) {
    const dailymap = new Map();

    forecastdata.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'numeric' });
        const temp = item.main.temp;
        const icon = item.weather[0].icon;

        if (!dailymap.has(day)) {
            dailymap.set(day, { temp, icon, date: day.split(',')[1], day: day.split(',')[0] });
        }
    });

    return Array.from(dailymap.values()).slice(0, 5); // Adjust to get the first 5 days
}
function getweathericon(icon) {
    // Map OpenWeatherMap icon codes to FontAwesome classes
    const iconMap = {
        '01d': 'fa-sun',
        '01n': 'fa-moon',
        '02d': 'fa-cloud-sun',
        '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud',
        '03n': 'fa-cloud',
        '04d': 'fa-cloud',
        '04n': 'fa-cloud',
        '09d': 'fa-cloud-showers-heavy',
        '09n': 'fa-cloud-showers-heavy',
        '10d': 'fa-cloud-rain',
        '10n': 'fa-cloud-rain',
        '11d': 'fa-bolt',
        '11n': 'fa-bolt',
        '13d': 'fa-snowflake',
        '13n': 'fa-snowflake',
        '50d': 'fa-smog',
        '50n': 'fa-smog'
    };
    return iconMap[icon] || 'fa-cloud';
}

function airqualitydes(aqi){
    const airqualitymap={
        1:'good',
        2:'Fair',
        3:'Moderate',
        4:'Poor',
        5:'very poor'
    };
    return airqualitymap[aqi] || 'unknown'
}

