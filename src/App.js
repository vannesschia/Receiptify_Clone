import './App.css'
import * as React from 'react';
import axios from 'axios'
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';

function App() {
  const CLIENT_ID = process.env.REACT_APP_API_KEY;
  const REDIRECT_URI = "http://localhost:3000/";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [token, setToken] = useState("");
  const [topShortItems, setTopShortItems] = useState([]);
  const [topMedItems, setTopMedItems] = useState([]);
  const [topLongItems, setTopLongItems] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [profile, setProfile] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [orderNum, setOrderNum] = useState("");
  const [currDate, setCurrDate] = useState("");
  const [shortDur, setShortDur] = useState("");
  const [medDur, setMedDur] = useState("");
  const [longDur, setLongDur] = useState("");
  const [currDur, setCurrDur] = useState("");

  //Calculates the Total Time Duration for all songs
  const getTotalDuration = (arr) => {
    let totalDur = 0;
    arr.map((item) => {
      totalDur = totalDur + item;
    });
    var min = ~~(totalDur / 60000);
    var seconds = (((totalDur % 60000) / 1000).toFixed(0) < 10 ? '0' : '') + ((totalDur % 60000) / 1000).toFixed(0);
    return min + ":" + seconds;
  }

  //Data Fetching
  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

      window.location.hash = ""
      window.localStorage.setItem("token", token)
    }

    if (!window.localStorage.getItem('initial') || !window.localStorage.getItem('checked')) {
      window.localStorage.setItem('initial', '1');
      window.localStorage.setItem('checked', '1');
    }

    setToken(token);
    getDate();

    if (token && token !== "") {
      axios.get("https://api.spotify.com/v1/me/top/tracks", {
        headers: {
          Authorization: 'Bearer ' + token,
        },
        params: {
          time_range: 'short_term',
          limit: 10,
          offset: 0
        }
      })
        .then((data) => {
          console.log(data.data.items);
          setTopShortItems(data.data.items);
          setShortDur(getTotalDuration(data.data.items.map((item) => item.duration_ms)));
          //depending on radtion button selected before login, requested info will be displayed after login
          if (window.localStorage.getItem('initial') === '1') {
            console.log('1');
            setTopItems(data.data.items);
            setTimeValue("LAST MONTH");
            setCurrDur(getTotalDuration(data.data.items.map((item) => item.duration_ms)));
            setOrderNum("#0001");
            window.localStorage.removeItem('checked');
            window.localStorage.removeItem('initial');
          }
        })
        .catch((error) => {
          console.log(error);
        })

      axios.get("https://api.spotify.com/v1/me/top/tracks", {
        headers: {
          Authorization: 'Bearer ' + token,
        },
        params: {
          time_range: 'medium_term',
          limit: 10,
          offset: 0
        }
      })
        .then((data) => {
          console.log(data.data.items);
          setTopMedItems(data.data.items);
          setMedDur(getTotalDuration(data.data.items.map((item) => item.duration_ms)));
          if (window.localStorage.getItem('initial') === '2') {
            console.log('2');
            setTopItems(data.data.items);
            setTimeValue("LAST 6 MONTHS");
            setCurrDur(getTotalDuration(data.data.items.map((item) => item.duration_ms)));
            setOrderNum("#0002");
            window.localStorage.removeItem('checked');
            window.localStorage.removeItem('initial');
          }
        })
        .catch((error) => {
          console.log(error);
        })

      axios.get("https://api.spotify.com/v1/me/top/tracks", {
        headers: {
          Authorization: 'Bearer ' + token,
        },
        params: {
          time_range: 'long_term',
          limit: 10,
          offset: 0
        }
      })
        .then((data) => {
          console.log(data.data.items)
          setTopLongItems(data.data.items);
          setLongDur(getTotalDuration(data.data.items.map((item) => item.duration_ms)));
          if (window.localStorage.getItem('initial') === '3') {
            console.log('3');
            setTopItems(data.data.items);
            setTimeValue("ALL TIME");
            setCurrDur(getTotalDuration(data.data.items.map((item) => item.duration_ms)));
            setOrderNum("#0003");
            window.localStorage.removeItem('checked');
            window.localStorage.removeItem('initial');
          }
        })
        .catch((error) => {
          console.log(error);
        })

      //fetching user's name
      axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })
        .then((data) => {
          console.log(data.data)
          setProfile(data.data.display_name)
        })
        .catch((error) => {
          console.log(error);
        })
    }
  }, [])

  //Logout
  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
    setTopItems([]);
  }

  //Displays current date in a specific way
  const getDate = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const weekNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date();
    setCurrDate(monthNames[d.getMonth()] + ", " + weekNames[d.getDay()] + " " + d.getDate() + ", " + d.getFullYear());
  }

  return (
    <div className="App">
      <header>
        <h1 style={{ fontWeight: 'bold' }}>Receiptify Clone</h1>

        {!token ?
          <div>
            <div className="btn-group" role="group" aria-label="Basic checkbox toggle button group">
              <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" defaultChecked />
              <label onClick={() => {
                window.localStorage.setItem('initial', '1');
                window.localStorage.setItem('checked', '1');
              }} className="btn btn-outline-primary" htmlFor="btnradio1">Last Month</label>

              <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" />
              <label onClick={() => {
                window.localStorage.setItem('initial', '2');
                window.localStorage.setItem('checked', '2');
              }} className="btn btn-outline-primary" htmlFor="btnradio2">Last 6 Months</label>

              <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" />
              <label onClick={() => {
                window.localStorage.setItem('initial', '3');
                window.localStorage.setItem('checked', '3');
              }} className="btn btn-outline-primary" htmlFor="btnradio3">All Time</label>
            </div>
          </div>
          : null}

        {token ?
          <div>
            <div className="btn-group" role="group" aria-label="Basic checkbox toggle button group">
              <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" readOnly checked={window.localStorage.getItem('checked') === '1' ? 'checked' : null} />
              <label onClick={() => {
                setTopItems(topShortItems);
                setTimeValue("LAST MONTH");
                setCurrDur(shortDur);
                setOrderNum("#0001");
              }} className="btn btn-outline-primary" htmlFor="btnradio1">Last Month</label>

              <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" readOnly checked={window.localStorage.getItem('checked') === '2' ? 'checked' : null} />
              <label onClick={() => {
                setTopItems(topMedItems);
                setTimeValue("LAST 6 MONTHS");
                setCurrDur(medDur);
                setOrderNum("#0002");
              }} className="btn btn-outline-primary" htmlFor="btnradio2">Last 6 Months</label>

              <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" readOnly checked={window.localStorage.getItem('checked') === '3' ? 'checked' : null} />
              <label onClick={() => {
                setTopItems(topLongItems);
                setTimeValue("ALL TIME");
                setCurrDur(longDur);
                setOrderNum("#0003");
              }} className="btn btn-outline-primary" htmlFor="btnradio3">All Time</label>
            </div>
          </div>
          : null}

        <br></br>
        {/* <button onClick={() => {
          setTopItems(topShortItems);
          setTimeValue("LAST MONTH");
          setCurrDur(shortDur);
          setOrderNum("#0001")}}>Last Month</button>
        <button onClick={() => {
          setTopItems(topMedItems);
          setTimeValue("LAST 6 MONTHS");
          setCurrDur(medDur);
          setOrderNum("#0002")}}>Last 6 Month</button>
        <button onClick={() => {
          setTopItems(topLongItems);
          setTimeValue("ALL TIME");
          setCurrDur(longDur);
          setOrderNum("#0003");}}>All Time</button> */}

        {token ?
          <div style={{ marginBottom: '50px' }}>
            <div className='background' style={{ overflow: 'auto', margin: 'auto', position: 'relative', width: 350 }}>

              <div style={{ textAlign: 'center', color: "black", width: 300, margin: 'auto', }}>
                <div style={{ fontWeight: 'bold', fontSize: '25px' }}> RECEIPTIFY CLONE </div>
                <div style={{ fontWeight: 'normal', fontSize: '15px', marginBottom: '20px' }}>{timeValue}</div>
              </div>

              <div className="font-face-mc" style={{ textAlign: 'left', color: "black", width: 300, margin: 'auto', }}>
                <div>
                  ORDER {orderNum} FOR {profile.toUpperCase()} <br></br>
                  {currDate.toUpperCase()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTopStyle: 'dashed', borderBottomStyle: 'dashed' }}>
                  <div style={{ marginRight: 10 }}>
                    QTY
                  </div>
                  <div style={{ flexGrow: '1', paddingRight: 20 }}>
                    ITM
                  </div>
                  <div style={{ marginLeft: '20px' }}>
                    AMT
                  </div>
                </div>
                {topItems ?
                  topItems.map((item, index) => (
                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ marginRight: 10 }}>
                        {(index + 1) != 10 ? '0' + (index + 1) : index + 1}
                      </div>
                      <div style={{ marginLeft: '10px', textAlign: 'left', flexGrow: '1', paddingRight: 20 }}>
                        {item.name.toUpperCase()} - {item.artists[0].name.toUpperCase()}
                        {item.artists.slice(1).map((artist) => (", " + artist.name.toUpperCase()))}
                      </div>
                      <div style={{ marginLeft: '20px' }}>
                        {~~(item.duration_ms / 60000)}:{(((item.duration_ms % 60000) / 1000).toFixed(0) < 10 ? '0' : '') + ((item.duration_ms % 60000) / 1000).toFixed(0)}
                      </div>
                    </div>
                  ))
                  : null}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTopStyle: 'dashed', borderBottomStyle: 'dashed' }}>
                  <div style={{}}>
                    ITEM COUNT: <br /> TOTAL:
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    10 <br /> {currDur}
                  </div>
                </div>
                <div>
                  CARD #: **** **** **** {new Date().getFullYear()} <br /> AUTH CODE: 123421 <br /> CARDHOLDER: {profile.toUpperCase()}
                </div>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  THANKS FOR VISITING!
                </div>
              </div>

            </div>
          </div>
          : null}

        {!token ?
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user%2dtop%2dread&response_type=${RESPONSE_TYPE}`} className="btn btn-success" role="button">Login
            to Spotify</a>
          : <button className="logout_button" onClick={logout}>Logout</button>}

      </header>
    </div>
  );
}

export default App;
