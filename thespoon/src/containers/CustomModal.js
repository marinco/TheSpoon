//<editor-fold desc="React">
import React, {Component} from "react";
//</editor-fold>
//<editor-fold desc="Redux">
import {connect} from "react-redux";
import {setModalVisibilityFilterAction} from "../actionCreators/modalVisibilityFilterActionCreators";
//</editor-fold>
//<editor-fold desc="Bootstrap">
import {Modal} from "react-bootstrap";
//</editor-fold>

//<editor-fold desc="Constants">
import {modalVisibilityFilters} from "../constants/modalVisibiltyFilters";
import {roles} from "../constants/roles";
//</editor-fold>
//<editor-fold desc="Modals">
import ChooseRoleModal from "../components/authentification/ChooseRoleModal";
import LogIn from "../components/authentification/LogIn";
import RegisterRestaurantowner from "../components/authentification/RegisterRestaurantowner";
import FillRestaurantInfo from "../components/authentification/FillRestaurantInfo"
import RegisterCustomer from "../components/authentification/RegisterCustomer";
import EditRestaurantInfoModal from "../components/restaurantPage/EditRestaurantInfoModal";
import AddMenuModal from "../components/restaurantPage/AddMenuModal";
import EditMenuModal from "../components/restaurantPage/EditMenuModal";
import {setCurrentMenuId} from "../actionCreators/CurrentMenuIdActionCreators";
//</editor-fold>

class CustomModal extends Component {

    //<editor-fold desc="Business Logic">
    getVisibleModal = (filter, itemId) => {
        switch (filter) {
            case modalVisibilityFilters.SHOW_LOGIN:
                return (
                    <LogIn onHide={() => this.props.handleClose()} />
                );
            case modalVisibilityFilters.SHOW_CHOOSE_ROLE:
                return (
                    <ChooseRoleModal onHide={() => this.props.handleClose()} />
                );
            case modalVisibilityFilters.SHOW_REGISTER_RESTAURANT_OWNER:
                return (
                    <RegisterRestaurantowner
                        role={roles.RESTAURANT_OWNER}
                        onHide={() => this.props.handleClose()}/>
                );
            case modalVisibilityFilters.SHOW_RESTAURANT_INFORMATION:
                return (
                    <FillRestaurantInfo
                        role={roles.RESTAURANT_OWNER}
                        onHide={() => this.props.handleClose()}
                        />
                );
            case modalVisibilityFilters.SHOW_REGISTER_CUSTOMER:
                return (
                    <RegisterCustomer
                        role={roles.CUSTOMER}
                        onHide={() => this.props.handleClose()}/>
                );
            case modalVisibilityFilters.SHOW_EDIT_RESTAURANT_INFORMATION:
                return (
                    <EditRestaurantInfoModal
                        onHide={() => this.props.handleClose()}/>
                );
            case modalVisibilityFilters.SHOW_ADD_MENU:
                return (
                    <AddMenuModal
                        onHide={() => this.props.handleClose()}/>
                );
            case modalVisibilityFilters.SHOW_EDIT_MENU:
                return (
                    <EditMenuModal
                        onHide={() => this.props.handleClose()}
                        menuId={ itemId }/>
                );
            default:
                return null;
        }
    };
    //</editor-fold>

    //<editor-fold desc="Render">
    render() {
        if(this.props.modalVisibilityFilter !== modalVisibilityFilters.HIDE_ALL) {
            return(
                <Modal show={true} onHide={() => this.props.handleClose()} centered>
                    {this.getVisibleModal(this.props.modalVisibilityFilter, this.props.currentMenuId)}
                </Modal>
            );
        }
        else {
            return null;
        }
    }
    //</editor-fold>
}

//<editor-fold desc="Redux">
const mapStateToProps = (state) => {
    return {
        modalVisibilityFilter: state.modalVisibilityFilter,
        currentMenuId: state.currentMenuId
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        handleClose: () => {
            dispatch(setModalVisibilityFilterAction(modalVisibilityFilters.HIDE_ALL))
            dispatch(setCurrentMenuId(null))
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomModal)
//</editor-fold>