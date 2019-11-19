//<editor-fold desc="React Import">
import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom'
import paths from '../../constants/paths';
//</editor-fold>
//<editor-fold desc="Redux import">
import {connect} from "react-redux";
//</editor-fold>
//<editor-fold desc="RxJs import">
import {ajax} from "rxjs/ajax";
import {take} from 'rxjs/operators';
//</editor-fold>
//<editor-fold desc="Bootstrap import">
import {Modal, ButtonToolbar, ToggleButtonGroup, ToggleButton} from "react-bootstrap";
//</editor-fold>
import MainLayout from '../layout/MainLayout.js'
import {authentificationModalVisibilityFilters} from "../../constants/modalVisibiltyFilters";
import FilterLink from "../../containers/FilterModalLink";
import FormValidator from "../../validation/FormValidator";

class MainPage extends Component {
    //<editor-fold desc="Render">
    render() {
        console.log(this.props.username);
        return (
            <MainLayout >
                <div className="mainpage-banner">
                    <div className="mainpage-text">
                        <div className="container">
                            <div className="row">
                                <div className="col-sm-8">
                                    <h1 className="title">Hello {this.props.role ? "Restaurant owner" : "Customer"} {this.props.username}</h1>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </MainLayout>
        );
    }
    //</editor-fold>
}

//<editor-fold desc="Redux">
const mapStateToProps = (state) => {
    console.log(state)
    return {
        role: state.logInRegisterReducer.role,
        username: state.logInRegisterReducer.username,
        token: state.logInRegisterReducer.token
    };
};

export default connect(mapStateToProps, null)(MainPage);
//</editor-fold>