import React from "react";
import {BrowserRouter, Switch, Route, Link} from "react-router-dom";
import HomePage from "./components/HomePage/Homepage";
import CustomModal from "./containers/CustomModal";
import Dashboard from "./components/DashboardPage/YourDashboardPage";
import YourRestaurantPage from "./components/RestaurantPage/YourRestaurantPage";
import Profile from "./components/ProfilePage/YourProfilePage";
import CustomerMainPage from "./components/MainPage/CustomerMainPage";
import FailPage from "./components/FailPage/FailPage";

function App() {
    return (
        <BrowserRouter>
            {<CustomModal />}
            <Switch>
                <Route exact path="/" component={HomePage} />
                <Route exact path="/Dashboard" component={Dashboard} />
                <Route exact path="/YourRestaurant" component={YourRestaurantPage} />
                <Route exact path="/Profile" component={Profile} />
                <Route exact path="/CustomerMain" component={CustomerMainPage} />
                <Route component={FailPage}/>
            </Switch>
        </BrowserRouter>
    );
}

export default App;
