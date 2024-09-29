import React from "react";
import WxButton from "@components/WxButton";
import WxInput from "@components/WxInput";
import WxModal from "@components/WxModal";
import WxModalBody from "@components/WxModal/WxModalBody";
import WxModalFooter from "@components/WxModal/WxModalFooter";
import WxModalHeader from "@components/WxModal/WxModalHeader";

interface CustomerPropsModalProps {
  register: any;
  show: boolean;
  onHide: Function;
  onSubmit: Function;
  handleSubmit: Function;
  errors?: any;
}

export const CustomerAddressModal = ({
  show,
  onHide,
  register,
  handleSubmit,
  onSubmit,
  errors,
}: CustomerPropsModalProps) => {
  return (
    <WxModal show={show}>
      <WxModalHeader
        title="Customer Address Update"
        closeIconAction={() => onHide(false)}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <WxModalBody>
          <div className="wx__row">
            <div className="wx__col-md-12">
              <WxInput
                registerProperty={{
                  ...register("address.title", { required: false }),
                }}
                label="Title"
                className="wx__mb-0"
              />
            </div>
            <div className="wx__col-md-12">
              <WxInput
                registerProperty={{
                  ...register("address.addressLine1", {
                    required: true,
                  }),
                }}
                label="Address Line 1"
                className="wx__mb-0"
                color={errors?.address?.addressLine1 ? "danger" : "secondary"}
                errorMessage={
                  errors?.address?.addressLine1 && "Address Line 1 is required!"
                }
              />
            </div>
            <div className="wx__col-md-12">
              <WxInput
                registerProperty={{
                  ...register("address.addressLine2", {
                    required: false,
                  }),
                }}
                label="Address Line 2"
                className="wx__mb-0"
              />
            </div>
            <div className="wx__col-md-6">
              <WxInput
                registerProperty={{
                  ...register("address.cityName", { required: true }),
                }}
                label="District/City"
                className="wx__mb-0"
                color={errors?.address?.cityName ? "danger" : "secondary"}
                errorMessage={
                  errors?.address?.cityName &&
                  "Address District/City is required!"
                }
              />
            </div>
            <div className="wx__col-md-6">
              <WxInput
                registerProperty={{
                  ...register("address.state", { required: true }),
                }}
                label="Division/State"
                className="wx__mb-0"
                color={errors?.address?.state ? "danger" : "secondary"}
                errorMessage={
                  errors?.address?.state &&
                  "Address Division/State is required!"
                }
              />
            </div>
            <div className="wx__col-md-6">
              <WxInput
                registerProperty={{
                  ...register("address.postCode", { required: true }),
                }}
                label="Post code"
                className="wx__mb-0"
              />
            </div>
            <div className="wx__col-md-6">
              <WxInput
                registerProperty={{
                  ...register("address.country", { required: false }),
                }}
                label="Country"
                className="wx__mb-0"
              />
            </div>
            <div className="wx__col-md-6">
              <WxInput
                registerProperty={{
                  ...register("address.phone", {
                    required: false,
                  }),
                }}
                label="Phone Number"
                className="wx__mb-0"
              />
            </div>
            <div className="wx__col-md-6">
              <WxInput
                registerProperty={{
                  ...register("address.email", {
                    required: false,
                  }),
                }}
                label="Email Address"
                className="wx__mb-0"
                type="email"
              />
            </div>
          </div>
        </WxModalBody>
        <WxModalFooter>
          <WxButton type="submit" variant="fill">
            Save
          </WxButton>
        </WxModalFooter>
      </form>
    </WxModal>
  );
};
