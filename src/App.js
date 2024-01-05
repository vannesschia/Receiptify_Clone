import './App.css'
import * as React from 'react';
import axios from 'axios'
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';

function App() {
  const CLIENT_ID = process.env.REACT_APP_API_KEY;
  const REDIRECT_URI = "http://vannesschia.github.io/Receiptify_Clone";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [token, setToken] = useState("");
  const [selectedValue, setSelectedValue] = useState(0);
  const [profile, setProfile] = useState("");
  const [currDate, setCurrDate] = useState("");
  const [topShortItems, setTopShortItems] = useState({
    timeValue: "LAST MONTH",
    orderNum: "0001",
    topItems: [],
    currDur: "",
  });
  const [topMedItems, setTopMedItems] = useState({
    timeValue: "LAST 6 MONTHS",
    orderNum: "0002",
    topItems: [],
    currDur: "",
  });
  const [topLongItems, setTopLongItems] = useState({
    timeValue: "ALL TIME",
    orderNum: "0003",
    topItems: [],
    currDur: "",
  });
  const [selectedItems, setSelectedItems] = useState({
    timeValue: "",
    orderNum: "",
    topItems: [],
    currDur: "",
  });

  //Calculates the total time duration for all songs
  const getTotalDuration = (arr) => {
    let totalDur = 0;
    arr.map((item) => {
      totalDur = totalDur + item;
    });
    var min = ~~(totalDur / 60000);
    var seconds = (((totalDur % 60000) / 1000).toFixed(0) < 10 ? '0' : '') + ((totalDur % 60000) / 1000).toFixed(0);
    return min + ":" + seconds;
  }

  //Logout
  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
    setSelectedValue(1);
    setSelectedItems([]);
    window.localStorage.removeItem('checked');
  }

  //Displays current date in a specific way
  const getDate = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const weekNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date();
    setCurrDate(monthNames[d.getMonth()] + ", " + weekNames[d.getDay()] + " " + d.getDate() + ", " + d.getFullYear());
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

    setToken(token);
    getDate();
    
    if (token && token !== "") {
      setIsLoading(true);
      axios.all([
        axios.get("https://api.spotify.com/v1/me/top/tracks", {
          headers: {
            Authorization: 'Bearer ' + token,
          },
          params: {
            time_range: 'short_term',
            limit: 10,
            offset: 0
          }
        }),
        axios.get("https://api.spotify.com/v1/me/top/tracks", {
          headers: {
            Authorization: 'Bearer ' + token,
          },
          params: {
            time_range: 'medium_term',
            limit: 10,
            offset: 0
          }
        }),
        axios.get("https://api.spotify.com/v1/me/top/tracks", {
          headers: {
            Authorization: 'Bearer ' + token,
          },
          params: {
            time_range: 'long_term',
            limit: 10,
            offset: 0
          }
        }),
        axios.get("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }),
      ])
      .then(axios.spread((data1, data2, data3, data4) => {
        // Fetch short term data
        setTopShortItems({
          ...topShortItems,
          topItems: data1.data.items,
          currDur: getTotalDuration(data1.data.items.map((item) => item.duration_ms)),
        })

        // Fetch medium term data
        setTopMedItems({
          ...topMedItems,
          topItems: data2.data.items,
          currDur: getTotalDuration(data2.data.items.map((item) => item.duration_ms)),
        })
        
        // Fetch long term data
        setTopLongItems(topLongItems => ({
          ...topLongItems,
          topItems: data3.data.items,
          currDur: getTotalDuration(data3.data.items.map((item) => item.duration_ms)),
        }))

        // fetch user's name
        setProfile(data4.data.display_name)
        
        // update button group after render
        if (window.localStorage.getItem('checked') !== null) {
          if (window.localStorage.getItem('checked') === '1') {
            setSelectedValue(1);
            setSelectedItems({
              timeValue: "LAST MONTH",
              orderNum: "0001",
              topItems: data1.data.items,
              currDur: getTotalDuration(data1.data.items.map((item) => item.duration_ms)),
            });
          } else if (window.localStorage.getItem('checked') === '2') {
            setSelectedValue(2);
            setSelectedItems({
              timeValue: "LAST 6 MONTHS",
              orderNum: "0002",
              topItems: data2.data.items,
              currDur: getTotalDuration(data2.data.items.map((item) => item.duration_ms)),
            });
          } else {
            setSelectedValue(3);
            setSelectedItems({
              timeValue: "ALL TIME",
              orderNum: "0003",
              topItems: data3.data.items,
              currDur: getTotalDuration(data3.data.items.map((item) => item.duration_ms)),
            });
          }
        } else {
          setSelectedValue(1);
          setSelectedItems({
            timeValue: "LAST MONTH",
            orderNum: "0001",
            topItems: data1.data.items,
            currDur: getTotalDuration(data1.data.items.map((item) => item.duration_ms)),
          });
        }

        setIsLoading(false);
      }))
      .catch((error) => {
        console.log(error);
        setError(true);
      })
    }
  }, [])

  if (error) {
    return (
      <>
      <div>
        <p style={{fontWeight: 'bold'}}>Looks like an error has occurred :(</p>
        <p>Please try again later...Thank you!</p>
      </div>
      </>
    )
  }


  return (
    <div className="App">
      <header>
        <h1 style={{fontWeight: 'bold'}}>Receiptify Clone</h1>

        {!token ?
          <div>
            <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
              <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" defaultChecked />
              <label onClick={() => {window.localStorage.setItem('checked', '1')}} className="btn btn-outline-primary" htmlFor="btnradio1">Last Month</label>

              <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" />
              <label onClick={() => {window.localStorage.setItem('checked', '2')}} className="btn btn-outline-primary" htmlFor="btnradio2">Last 6 Months</label>

              <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" />
              <label onClick={() => {window.localStorage.setItem('checked', '3')}} className="btn btn-outline-primary" htmlFor="btnradio3">All Time</label>
            </div>
          </div>
          : null}

        {token && isLoading === false ?
          <div>
            <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
              <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" readOnly checked={selectedValue === 1 ? true : false} />
              <label onClick={() => {
                setSelectedValue(1);
                setSelectedItems(topShortItems);
              }} className="btn btn-outline-primary" htmlFor="btnradio1">Last Month</label>

              <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" readOnly checked={selectedValue === 2 ? true : false} />
              <label onClick={() => {
                setSelectedValue(2);
                setSelectedItems(topMedItems);
              }} className="btn btn-outline-primary" htmlFor="btnradio2">Last 6 Months</label>

              <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" readOnly checked={selectedValue === 3 ? true : false} />
              <label onClick={() => {
                setSelectedValue(3);
                setSelectedItems(topLongItems);
              }} className="btn btn-outline-primary" htmlFor="btnradio3">All Time</label>
            </div>
          </div>
          : null}

        <br></br>

        {token && isLoading === false ?
          <div style={{ marginBottom: '50px' }}>
            <div className='background' style={{ overflow: 'auto', margin: 'auto', position: 'relative', width: 350 }}>

              <div style={{ textAlign: 'center', color: "black", width: 300, margin: 'auto', }}>
                <div style={{ fontWeight: 'bold', fontSize: '25px' }}> RECEIPTIFY CLONE </div>
                <div style={{ fontWeight: 'normal', fontSize: '15px', marginBottom: '20px' }}>{selectedItems.timeValue}</div>
              </div>

              <div className="font-face-mc" style={{ textAlign: 'left', color: "black", width: 300, margin: 'auto', }}>
                <div>
                  ORDER {selectedItems.orderNum} FOR {profile.toUpperCase()} <br></br>
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
                {selectedItems.topItems ?
                  selectedItems.topItems.map((item, index) => (
                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ marginRight: 10 }}>
                        {(index + 1) !== 10 ? '0' + (index + 1) : index + 1}
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
                    10 <br /> {selectedItems.currDur}
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
