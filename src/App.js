
import './App.css';
// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate  } from 'react-router-dom';
import Login from './components/Login';
import { GetAccount } from './components/handlers';
import Dashboard from './components/Dashboard';

function Auth() {
  const navigate = useNavigate();
  const fetchMyAPI = React.useCallback(async () => {
    console.log("getting user");
    await GetAccount().then( (acc)=>{
    
      localStorage.removeItem("user");
      localStorage.removeItem("picture");
      localStorage.setItem("user", acc.response.name);
      localStorage.setItem("picture", acc.response.picture);
      console.log("already written", localStorage.getItem("user"));
      console.log("got user");
      navigate('/', {state:{"user": localStorage.getItem("user"), "picture": localStorage.getItem("picture")}});
    }
    );
   // return {name:  acc.response.name, picture:  acc.response.picture}
    
  }, []); // if userId changes, useEffect will run again
  fetchMyAPI();
  //console.log("res=",res);
  //React.useEffect(() => {
  //  fetchMyAPI();}, [fetchMyAPI]);
    ///navigate('/', {state:{"user": localStorage.getItem("name"), "picture": null}
  //window.location.replace("/");
  
  
  return (<></>)
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/' element={<Dashboard user={localStorage.getItem("user")} picture={localStorage.getItem("picture")}/>} />
        <Route path='/auth' element={<Auth/>} />
      </Routes>
    </Router>
  );
}

export default App;
