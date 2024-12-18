import MainLg from "@components/MainContentLayout/MainLg";
import PhoneNumberInput from "@components/PhoneWithCountryCode";
import Select from "@components/Select/Select";
import {
  FormContainer,
  FormFooter,
  FormHeader,
} from "@components/FormLayout";
import TextInput from "@components/TextInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { SETTINGS_DELIVERY } from "routes/path-name.route";
import { ECourierService } from "services/api/courier/ECourier.service";
import { LocalStorageService } from "services/utils/local-storage.service";
import { ToastService } from "services/utils/toastr.service";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { ECourierSchema } from "./ECourierFormSchema";

const CourierForm = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [thana, setThana] = useState([]);
  const [mobileBankingType, setMobileBankingType] = useState([
    {
      id: 1,
      text: "Personal",
    },
    {
      id: 2,
      text: "Agent",
    },
  ]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ECourierSchema),
    // defaultValues: {
    //   pick_mobile: phoneNumber,
    // },
  });

  const navigate = useNavigate();
  const { key } = useParams();

  useEffect(() => {
    getECourierStoreInfo();
    getDistrict();
  }, []);

  useEffect(() => {
    if (watch("pick_district")) getThana(watch("pick_district"));
  }, [watch("pick_district")]);

  const getECourierStoreInfo = () => {
    ECourierService.eCourierStoreInfo()
      .then((res) => {
        setPhoneNumber(res?.body?.pick_mobile);
        reset({ ...res.body });
        setValue("pick_district", res.body.pick_district);
      })
      .catch((err) => ToastService.error(err.message));
  };

  const getDistrict = () => {
    ECourierService.eCourierCity()
      .then((res) => setDistricts(res.body))
      .catch((err) => ToastService.error(err.message));
  };

  const getThana = async (city = "dhaka") => {
    await ECourierService.eCourierThana(city)
      .then((res) => setThana(res.body))
      .catch((err) => ToastService.error(err.message));
  };

  const onSubmit = (data) => {
    ECourierService.eCourierStoreInfoCreate({
      pick_mobile: phoneNumber,
      ...data,
    })
      .then((res) => {
        reset();
        navigate(SETTINGS_DELIVERY);
      })
      .catch((err) => ToastService.error(err.message));
  };

  return (
    <MainLg className="delivery_zone_sec">
      <FormContainer>
        {/* {getValues("pick_district")} */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormHeader
            title="Courier"
            backNavigationLink={SETTINGS_DELIVERY}
          />
          <div className="card p-4 mb-3">
            <div className="row">
              <div className="col-lg-6 col-md-12 col-sm-6">
                <TextInput
                  label="Pickup contact name"
                  registerProperty={{
                    ...register("pick_contact_person"),
                  }}
                  isRequired
                  placeholder="Enter name"
                  color={errors?.pick_contact_person ? "danger" : "secondary"}
                  errorMessage={errors?.pick_contact_person?.message as string}
                />
              </div>
              <div className="col-lg-6 col-md-12 col-sm-6">
                <PhoneNumberInput
                  isRequired
                  label="Pickup contact number"
                  placeholder="Enter Number"
                  phoneNumber={phoneNumber}
                  setPhoneNumber={setPhoneNumber}
                  // registerProperty={{
                  //   ...register("pick_mobile", {
                  //     onChange: () => setValue("pick_mobile", phoneNumber),
                  //   }),
                  // }}
                />
              </div>

              <div className="col-lg-6 col-md-12 col-sm-6">
                <Controller
                  control={control}
                  name="pick_district"
                  rules={{ required: true }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <Select
                      label="District/City"
                      options={districts}
                      placeholder="Select District/City"
                      valuesKey="name"
                      textKey="name"
                      isRequired
                      value={value}
                      onChange={onChange}
                      isDisabled={!districts?.length}
                      color={error ? "danger" : "secondary"}
                      errorMessage={error && "District/City is required!"}
                    />
                  )}
                />
              </div>
              {/* )} */}
              <div className="col-lg-6 col-md-12 col-sm-6">
                <Controller
                  control={control}
                  name="pick_thana"
                  rules={{ required: true }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <Select
                      label="Thana"
                      options={thana}
                      placeholder="Select Thana"
                      valuesKey="name"
                      textKey="name"
                      isRequired
                      value={value}
                      onChange={onChange}
                      isDisabled={!thana?.length}
                      color={error ? "danger" : "secondary"}
                      errorMessage={error && "Thana is required!"}
                    />
                  )}
                />
              </div>
              <div className="col-lg-6 col-md-12 col-sm-6">
                <TextInput
                  label="Post code"
                  registerProperty={{
                    ...register("pick_union"),
                  }}
                  isDisabled={thana.length ? false : true}
                  placeholder="Enter Post code"
                  isRequired
                  color={errors?.pick_union ? "danger" : "secondary"}
                  errorMessage={errors?.pick_union?.message as string}
                />
              </div>

              <div className="col-md-6 col-sm-6">
                <TextInput
                  label="Address"
                  registerProperty={{
                    ...register("pick_address"),
                  }}
                  isRequired
                  placeholder="Enter Address"
                  color={errors?.pick_address ? "danger" : "secondary"}
                  errorMessage={errors?.pick_address?.message as string}
                />
              </div>
              {/* <div className="col-lg-6 col-md-12 col-sm-6">
                <TextInput
                  label="Phone Number"
                  registerProperty={{
                    ...register("pick_mobile", {
                      required: false,
                    }),
                  }}
                />
              </div> */}
              {/* <div className="col-lg-6 col-md-12 col-sm-6">
                <TextInput
                  label="Hub"
                  registerProperty={{
                    ...register("pickup.hub", {
                      required: false,
                    }),
                  }}
                />
              </div> */}
            </div>
          </div>

          <div className="card p-4">
            <h5 className="mb-3">Withdraw information</h5>

            <div className="row">
              <div className="col-md-6 col-12">
                <strong>Bank</strong>
                <TextInput
                  label="Account holder name"
                  registerProperty={{
                    ...register("accountHolderName"),
                  }}
                  color={errors?.accountHolderName ? "danger" : "secondary"}
                  errorMessage={errors?.accountHolderName?.message as string}
                />
                <TextInput
                  label="Bank name"
                  registerProperty={{
                    ...register("bankName"),
                  }}
                  color={errors?.bankName ? "danger" : "secondary"}
                  errorMessage={errors?.bankName?.message as string}
                />
                <TextInput
                  label="Branch name"
                  registerProperty={{
                    ...register("bankBranch"),
                  }}
                  color={errors?.bankBranch ? "danger" : "secondary"}
                  errorMessage={errors?.bankBranch?.message as string}
                />
                <TextInput
                  label="Account number"
                  type="number"
                  registerProperty={{
                    ...register("accountNo"),
                  }}
                  color={errors?.accountNo ? "danger" : "secondary"}
                  errorMessage={errors?.accountNo?.message as string}
                />
              </div>
              <div className="col-md-6 col-12">
                <strong>Mobile banking</strong>
                <TextInput
                  label="Bkash number"
                  registerProperty={{
                    ...register("bkash"),
                  }}
                  color={errors?.bkash ? "danger" : "secondary"}
                  errorMessage={errors?.bkash?.message as string}
                />

                <Select
                  label="Bkash type"
                  options={mobileBankingType}
                  placeholder="Select type"
                  valuesKey="text"
                  textKey="text"
                  registerProperty={{
                    ...register("bkashType"),
                  }}
                  isDisabled={watch("bkash") ? false : true}
                  color={errors?.bkashType ? "danger" : "secondary"}
                  errorMessage={errors?.bkashType?.message}
                />
                <TextInput
                  label="Rocket number"
                  registerProperty={{
                    ...register("rocket"),
                  }}
                  color={errors?.rocket ? "danger" : "secondary"}
                  errorMessage={errors?.rocket?.message as string}
                />
                {/* <TextInput
                  label="Rocket type"
                  registerProperty={{
                    ...register("withdraw.mobileBank.accountType"),
                  }}
                /> */}
                <Select
                  label="Rocket type"
                  options={mobileBankingType}
                  placeholder="Select type"
                  valuesKey="text"
                  textKey="text"
                  registerProperty={{
                    ...register("rocketType"),
                  }}
                  isDisabled={watch("rocket") ? false : true}
                  color={errors?.rocketType ? "danger" : "secondary"}
                  errorMessage={errors?.rocketType?.message}
                />
              </div>
            </div>
          </div>
          <FormFooter
            title="Unsaved Changes"
            saveButtonText="Save"
            isSaving={isSaving}
          />
        </form>
      </FormContainer>
    </MainLg>
  );
};

export default CourierForm;
