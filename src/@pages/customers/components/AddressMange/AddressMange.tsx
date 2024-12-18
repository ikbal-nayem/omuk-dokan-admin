import { ConfirmationModal } from "@components/ConfirmationModal/ConfirmationModal";
import {Button} from "@components/Button";
import Drawer from "@components/Drawer";
import DrawerBody from "@components/Drawer/DrawerBody";
import DrawerFooter from "@components/Drawer/DrawerFooter";
import DrawerHeader from "@components/Drawer/DrawerHeader";
import Icon from "@components/Icon";
import WxRadio from "@components/WxRadio/WxRadio";
import { IAddressesPayload } from "@interfaces/Customer.interface";
import { CustomerService } from "services/api/Customer.service";
import { LocationService } from "services/api/Location.service";
import { ToastService } from "services/utils/toastr.service";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AddressForm } from "./AddressFrom";
import "./AddressManage.scss";

type CustomerAddressProps = {
  drawerOpen?: boolean;
  handleFormClose?: Function;
  addresses?: any[];
  customerId: string;
  getCustomerAddress: any;
  isNewAddress: boolean;
  setIsNewAddress: any;
  onAddressSelect?: (address: IAddressesPayload) => void;
  selectedAddress?: IAddressesPayload;
};

const AddressManage = ({
  drawerOpen,
  handleFormClose,
  customerId,
  getCustomerAddress,
  addresses = [],
  isNewAddress,
  setIsNewAddress,
  onAddressSelect,
  selectedAddress,
}: CustomerAddressProps) => {
  const [isConfirmOpenModal, setIsConfirmOpenModal] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editData, setEditData] = useState<any>();
  const [deletedId, setDeletedId] = useState<string>("");

  const [countries, setCountries] = useState<any[]>([]);
  const [divisions, setDivision] = useState<any[]>([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");

  const [districts, setDistricts] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    if (!isConfirmOpenModal) setDeletedId("");
  }, [isConfirmOpenModal]);

  useEffect(() => {
    // getCountry();
    getDivisions();
  }, []);

  useEffect(() => {
    if (selectedDivisionId) {
      setDistricts([]);
      setValue("address.cityName", "");
      getDistricts();
    }
  }, [selectedDivisionId]);

  const handleEditorClose = () => {
    reset();
    setIsEditorOpen(false);
    setEditData({});
    setSelectedDivisionId("");
  };

  const handleEdit = (data: any) => {
    const findDivision = divisions.find(
      (item) => item.division_name_eng === data?.state
    );

    if (findDivision) setSelectedDivisionId(findDivision.division_id);
    reset();
    setValue("id", data?.id);
    setValue("title", data?.title);
    setValue("addressLine1", data?.addressLine1);
    setValue("addressLine2", data?.addressLine2);
    setValue("postCode", data?.postCode);
    setValue("state", findDivision ? JSON.stringify(findDivision) : "");
    setValue("email", data?.email);
    setValue("phone", data?.phone);
    setValue("country", data?.country);
    setEditData(data);
    if (!findDivision) {
      setIsEditorOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setIsConfirmOpenModal(true);
    setDeletedId(id);
  };

  const handleSave = (data: any) => {
    console.log(data);
    data.state = data.state ? JSON.parse(data.state).division_name_eng : "";
    data.customerId = customerId;
    if (editData?.id) {
      data.isDefault = editData.isDefault;
      CustomerService.updateAddress(data)
        .then((res) => {
          ToastService.success("Address updated successfully");
          setIsEditorOpen(false);
          setEditData({});
          getCustomerAddress();
          setSelectedDivisionId("");
        })
        .catch((err) => {
          ToastService.error(err.message);
        });
      return;
    }

    CustomerService.createAddress(data)
      .then((res) => {
        ToastService.success("Address created successfully!");
        setIsEditorOpen(false);
        setIsNewAddress(false);
        getCustomerAddress();
      })
      .catch((err) => {
        ToastService.error(err.message);
      });
  };
  const onConfirmAddress = () => {
    if (!deletedId) ToastService.error("Something went wrong");
    CustomerService.addressDelete([deletedId])
      .then((res) => {
        setIsConfirmOpenModal(false);
        setIsEditorOpen(false);
        ToastService.success("Address deleted successfully");
        getCustomerAddress();
        setEditData({});
      })
      .catch((err: any) => {
        ToastService.error(err?.message || "Something went wrong");
      });
  };

  const getDivisions = () => {
    LocationService.getDivision("19").then((res) => {
      setDivision(res.body);
    });
  };

  const onChangeDivision = (divisionInfo: any) => {
    if (!divisionInfo) return;
    divisionInfo = JSON?.parse(divisionInfo);
    if (!divisionInfo.division_id)
      ToastService.error("Please select valid Division or state");
    setSelectedDivisionId(divisionInfo.division_id);
  };

  const getDistricts = () => {
    LocationService.getDistrict("19", selectedDivisionId).then((res) => {
      setDistricts(res.body);
      if (editData) {
        setValue("cityName", editData?.cityName);
        setIsEditorOpen(true);
      }
    });
  };

  useEffect(() => {
    // console.log("isEditorOpen", isEditorOpen);
  }, [isEditorOpen]);
  return (
    <>
      <Drawer show={drawerOpen} handleClose={handleFormClose}>
        <div className="wx__manage_customer_group">
          {/* {deletedId} */}
          <DrawerHeader
            title={
              isEditorOpen
                ? `${editData?.id ? "Edit" : "Add"} Address`
                : "Manage Address"
            }
            backIconAction={isEditorOpen ? handleEditorClose : null}
            onClickClose={handleFormClose}
          />
          <form onSubmit={handleSubmit(handleSave)}>
            <DrawerBody>
              {isEditorOpen || isNewAddress ? (
                <AddressForm
                  errors={errors}
                  register={register}
                  divisions={divisions}
                  districts={districts}
                  onChangeDivision={onChangeDivision}
                />
              ) : (
                <div>
                  {addresses?.length
                    ? addresses.map((address) => (
                        <div key={address.id} className="address-edit">
                          <div className="d-flex align-items-center justify-content-center">
                            {onAddressSelect ? (
                              <WxRadio
                                singleUse
                                onChange={() => onAddressSelect(address)}
                                isChecked={address?.id === selectedAddress?.id}
                                key={selectedAddress?.id}
                              />
                            ) : null}
                            <div style={{ width: "100%" }}>
                              <div className="d-flex align-items-center mt-2 customer-location">
                                <Icon variants="round" icon="location_on" />
                                <span className="text ms_2">
                                  {address?.title || "---"}
                                </span>
                              </div>
                              <div className="address-text">
                                {address?.addressLine1 || "---"},{" "}
                                {address?.addressLine2 || "---"},{" "}
                                {address?.cityName || "---"},{" "}
                                {address?.state || "---"}{" "}
                                {address?.postCode || "---"},{" "}
                                {address?.country || "---"}.
                              </div>
                            </div>
                            <span
                              className="material-icons-round"
                              role="button"
                              onClick={() => handleEdit(address)}
                            >
                              edit
                            </span>
                          </div>
                        </div>
                      ))
                    : null}
                </div>
              )}
            </DrawerBody>
            <DrawerFooter>
              <div className="wx__manage_customer_group__footer">
                {editData?.id ? (
                  <div className="me-auto">
                    <Button
                      color="danger"
                      variant="fill"
                      onClick={() => handleDelete(editData?.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ) : null}
                <Button
                  type="button"
                  className="me-3"
                  variant="outline"
                  color="secondary"
                  onClick={() =>
                    isEditorOpen && getValues("id")
                      ? handleEditorClose()
                      : handleFormClose()
                  }
                >
                  Cancel
                </Button>
                <Button
                  type={isEditorOpen || isNewAddress ? "submit" : "button"}
                  variant="fill"
                  onClick={() => {
                    !isEditorOpen ? setIsEditorOpen(true) : null;
                    // !isEditorOpen ? reset() : null;
                  }}
                >
                  {isEditorOpen || isNewAddress ? "Save" : "Add Address"}
                </Button>
              </div>
            </DrawerFooter>
          </form>
          <ConfirmationModal
            onConfirm={() => onConfirmAddress()}
            isOpen={isConfirmOpenModal}
            setIsOpen={setIsConfirmOpenModal}
            title="Delete Address"
          />
        </div>
      </Drawer>
    </>
  );
};

export default AddressManage;
