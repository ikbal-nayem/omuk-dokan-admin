import WxButton from "@components/WxButton";
import WxHr from "@components/WxHr";
import WxIcon from "@components/WxIcon/WxIcon";
import WxInput from "@components/WxInput";
import { ENV } from "config/ENV.config";
import { yupResolver } from "@hookform/resolvers/yup";
import { AccountSettingService } from "services/api/AccountSetting.service";
import { LocalStorageService } from "services/utils/local-storage.service";
import Preloader from "services/utils/preloader.service";
import { ToastService } from "services/utils/toastr.service";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import avatar from "../../assets/images/avatar.png";

import EnterOTPModal from "@components/EnterOTPModal/EnterOTPModal";
import WxSelect from "@components/Select/WxSelect";
import { LocationService } from "services/api/Location.service";
import { ProfileService } from "services/api/settings/Profile.service";
import { useSearchParams } from "react-router-dom";
// import { useAppDispatch } from "store/hooks";
import WxMainMd from "@components/MainContentLayout/WxMainMd";
import { useDispatch } from "react-redux";
import { setUserInfo } from "store/reducers/userReducer";
import { compressImage, imageURLGenerate } from "utils/utils";
import "./AccountSetting.scss";
// import WxMainFull from "@components/MainContentLayout/WxMainFull";

const changePasswordSchema = yup.object({
  old_password: yup.string().required("Please type current password"),
  new_password: yup
    .string()
    .required("Please type new password")
    .notOneOf(
      [yup.ref("old_password")],
      "Password must not be match with current password"
    )
    .min(8, "password must be 8 characters"),
  cnf_new_password: yup
    .string()
    .required("Please type confirm password")
    .oneOf(
      [yup.ref("new_password"), null],
      "Password must be match with New Password"
    ),
});

// const userAddressSchema = yup.object({
//   id: yup.string(),
//   userId: yup.string(),
//   title: yup.string(),
//   type: yup.string(),
//   firstName: yup.string(),
//   lastName: yup.string(),
//   addressLine1: yup.string(),
//   addressLine2: yup.string(),
//   fullAddress: yup.string(),
//   cityName: yup.string(),
//   state: yup.string(),
//   postCode: yup.number(),
//   country: yup.string(),
//   phone: yup.number(),
//   email: yup.string().email(),
// });

const AccountSetting = () => {
  const [changePassword, setChangePassword] = useState<boolean>(false);
  const [infoLoading, setInfoLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [formSubmitLoader, setFormSubmitLoader] = useState<boolean>(false);

  const { phone }: any = LocalStorageService.get("user_data");
  // const { isAccountVerified }: any = LocalStorageService.get("todo") || {};

  const [isAccountVerified] = useState(
    LocalStorageService.get("todo").filter(
      (item) => item["isAccountVerified"]
    ) || []
  );

  const { key }: any = LocalStorageService.get("activePlan") || {};

  const [basicInfoBtn, setBasicInfoBtn] = useState<boolean>(false);
  const [userAddressBtn, setUserAddressBtn] = useState<boolean>(false);

  const [addressFlag, setAddressFlag] = useState<boolean>(false);

  const [userBasicInfo, setUserBasicInfo] = useState<any>({});
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");

  const dispatch = useDispatch();

  const [districts, setDistricts] = useState<any[]>([]);

  const [divisions, setDivision] = useState<any[]>([]);

  const [userAddress, setUserAddress] = useState<any>([]);
  const [specificUserAddress, setSpecificUserAddress] = useState<any>({});
  const [userAddressEdit, setUserAddressEdit] = useState<boolean>(false);

  // const [referralInfo,setReferralInfo] = useState<any>({

  // })

  const [otpModal, setOtpModal] = useState(false);
  const [isSubmittingEnablePartner, setIsSubmittingEnablePartner] =
    useState(false);

  const userId = LocalStorageService.get("uid") || null;

  const userData = LocalStorageService.get("user_data") || {};

  const [searchParams] = useSearchParams();

  const [editBasicInfo, setEditBasicInfo] = useState<boolean>(
    Boolean(searchParams.get("basic-info-edit")) || false
  );

  // for basic information
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm();

  // for change password
  const {
    register: passRegister,
    handleSubmit: passHandleSubmit,
    watch: passWatch,
    reset: passReset,
    formState: { errors: passErrors },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      cnf_new_password: "",
    },
  });

  // for user address

  const {
    register: addressRegister,
    handleSubmit: addressSubmit,
    setValue: addressSetValue,
    watch: addressWatch,
    reset: addressReset,
    control: addressControl,
    formState: { errors: addressErrors },
  } = useForm();

  // for get user info

  useEffect(() => {
    AccountSettingService.getBasicInfo(userId)
      .then((res) => {
        res.body.partnerUrl =
          process.env.REACT_APP_LANDING_PAGE +
          "register" +
          res.body?.partnerUrl;
        setUserBasicInfo(res.body);
        // const image =;
        reset({ ...res.body });
        LocalStorageService.set("user_data", {
          ...userData,
          phone: res.body.phone,
          email: res.body.email,
          first_name: res.body.firstName,
          last_name: res.body.lastName,
          image: res.body.image,
        });
        // setPreviewURL(image);
      })
      .catch((err) => ToastService.error(err));
  }, [userId, otpModal, editBasicInfo]);

  // get user address info
  useEffect(() => {
    getUserAllAddress();
  }, [addressFlag]);

  // get division
  useEffect(() => {
    getDivisions();
  }, []);

  // get district
  useEffect(() => {
    if (selectedDivisionId) {
      setDistricts([]);
      addressSetValue("cityName", "");
      getDistricts();
    }
  }, [selectedDivisionId]);

  // for user basic info update
  const updateBasicInfoSubmit = async (data) => {
    setBasicInfoBtn(true);
    data.id = LocalStorageService.get("uid");
    data.partnerCode = null;

    const formData = new FormData();

    if (data.file && data.file.length > 0) {
      const image = await compressImage(data.file[0]);
      // setPreviewURL(URL.createObjectURL(image));
      formData.append("file", image);
      delete data?.image;
    }
    delete data?.file;

    formData.append("body", JSON.stringify(data));

    setInfoLoading(true);

    AccountSettingService.updateProfile(formData)
      .then((res) => {
        ToastService.success(res?.message);
        setEditBasicInfo(false);
        const response = {
          ...userData,
          email: res?.body?.email,
          phone: res?.body?.phone,
          first_name: res?.body?.firstName,
          last_name: res?.body?.lastName,
          userProfileUpload: res?.body?.userProfileUpload,
          userAddressList: res?.body?.userAddressList,
          profile_img: res?.body?.image?.previewUrl,
        };
        LocalStorageService.set("user_data", response);
        dispatch(
          setUserInfo({
            user_data: response,
          })
        );
      })
      .catch((err) => ToastService.error(err.message))
      .finally(() => {
        setInfoLoading(false);
        setBasicInfoBtn(false);
      });
  };

  // profile address basic information

  const getUserAllAddress = () => {
    ProfileService.getAllUserAddress()
      .then((res) => {
        const user = res.body;
        setUserAddress(user);
        // addressReset(user[0]);
        // addressSetValue("addressLine1", user?.addressLine1);
        // addressSetValue("addressLine2", user?.addressLine2);
        // addressSetValue("zip", user?.zip);
        // addressSetValue("state", findDivision ? JSON.stringify(findDivision) : "");
        // addressSetValue("email", user?.email);
        // addressSetValue("phone", user?.phone);
        // addressSetValue("country", user?.country);
      })
      .catch((err) => ToastService.error(err.message));
  };

  // for account address

  const onChangeDivision = (divisionInfo: any) => {
    if (!divisionInfo) {
      addressSetValue("state", null);
      addressSetValue("cityName", null);
      setDistricts([]);
      return;
    }
    divisionInfo = JSON?.parse(divisionInfo);
    if (!divisionInfo.division_id)
      ToastService.error("Please select valid Division or state");
    setSelectedDivisionId(divisionInfo.division_id);
  };

  const getDivisions = () => {
    // Currenly hardcoded country id 19 for bangladesh
    LocationService.getDivision("19").then((res) => {
      setDivision(res.body);
    });
  };

  const getDistricts = () => {
    // Currenly hardcoded country id 19 for bangladesh
    LocationService.getDistrict("19", selectedDivisionId).then((res) => {
      setDistricts(res.body);
      addressSetValue("cityName", specificUserAddress?.cityName);
      setAddressFlag(true);
    });
  };

  // for password reset
  const passwordSubmit = (data) => {
    setIsLoading(true);
    AccountSettingService.changePassword(data)
      .then((res) => {
        passReset();
        LocalStorageService.clear();
        window.location.replace(
          ENV.LandingPageURL + "authenticate?logout=true"
        );
        ToastService.success(res.message);
      })
      .catch((err) => ToastService.error(err.message))
      .finally(() => setIsLoading(false));
  };

  //   const onEditAddress = () => {
  //     reset();
  //     const findDivision = divisions.find(
  //       (item) => item.division_name_eng === userAddress?.state
  //     );
  //     if (findDivision) setSelectedDivisionId(findDivision.division_id);
  //     addressSetValue("addressLine1", userAddress?.addressLine1);
  //     addressSetValue("addressLine2", userAddress?.addressLine2);
  //     addressSetValue("postCode", userAddress?.postCode);
  //     addressSetValue("state", findDivision ? JSON.stringify(findDivision) : "");
  //     addressSetValue("email", userAddress?.email);
  //     addressSetValue("phone", userAddress?.phone);
  //     addressSetValue("country", userAddress?.country);
  //     if (!userAddress.city) setAddressFlag(true);
  //   };

  const createUserAddress = (data) => {
    setUserAddressBtn(true);
    const selectedDivision = divisions.find(
      (item) => item.division_id === selectedDivisionId + ""
    );
    ProfileService.createUserAddress({
      ...data,
      userId: LocalStorageService.get("uid"),
      state: selectedDivision ? selectedDivision?.division_name_eng : "",
    })
      .then((res) => {
        ToastService.success(res.message);
        setAddressFlag(false);
      })
      .catch((err) => {
        ToastService.error(err.message);
        setUserAddressBtn(false);
      });
  };

  const updateUserAddress = (data) => {
    setUserAddressBtn(true);
    setFormSubmitLoader(true);
    const selectedDivision = divisions.find(
      (item) => item.division_id === selectedDivisionId + ""
    );
    ProfileService.updateUserAddress({
      ...data,
      userId: LocalStorageService.get("uid"),
      state:
        selectedDivision && data.state
          ? selectedDivision?.division_name_eng
          : "",
    })
      .then((res) => {
        ToastService.success(res.message);
        setAddressFlag(false);
      })
      .catch((err) => ToastService.error(err.message))
      .finally(() => {
        setFormSubmitLoader(false);
        setUserAddressBtn(false);
      });
  };

  const getUserAddressById = (id: string) => {
    const findDivision = divisions.find(
      (item) => item.division_name_eng === userAddress?.state
    );

    if (findDivision) setSelectedDivisionId(findDivision.division_id);

    ProfileService.getUserAddressById(id)
      .then((res) => {
        const state = res.body.state;
        if (state) {
          const findDivision = divisions.find((item) => {
            return item.division_name_eng === state;
          });
          onChangeDivision(JSON.stringify(findDivision));
          setSelectedDivisionId(findDivision?.division_id);
          addressReset({
            ...res.body,
            state: JSON.stringify(findDivision),
            cityName: res?.body?.cityName + "",
          });
          // addressSetValue("state", JSON.stringify(findDivision));
        } else {
          addressReset(res.body);
        }
        setSpecificUserAddress(res.body);
        setAddressFlag(true);
      })
      .catch((err) => ToastService.error(err.message));
  };

  const deleteUserAddressById = (id: string) => {
    ProfileService.deleteUserAddress(id)
      .then((res) => {
        ToastService.success(res.message);
        getUserAllAddress();
      })
      .catch((err) => ToastService.error(err.message));
  };

  const enablePartner = () => {
    setIsSubmittingEnablePartner(true);
    ProfileService.enablePartner()
      .then((res) => {
        ToastService.success(res?.message);
      })
      .catch((err) => ToastService.error(err.message))
      .finally(() => setIsSubmittingEnablePartner(false));
  };

  return (
    <WxMainMd>
      <div className="wx__account_setting">
        <h4 className="wx__text_h4 wx__text_medium">Account Setting</h4>
        <div className="">
          <div className="wx__bg-white wx__rounded overflow-hidden">
            <form
              onSubmit={handleSubmit(updateBasicInfoSubmit)}
              className="wx__p-3"
            >
              <div className="wx__d-flex wx__justify-content-between wx__align-items-center">
                <h5 className="wx__mb-0">Basic Information</h5>
                {editBasicInfo ? (
                  <div className="wx__d-flex">
                    <WxButton
                      color="secondary"
                      onClick={() => setEditBasicInfo(false)}
                    >
                      cancel
                    </WxButton>
                    {editBasicInfo && (
                      <WxButton
                        disabled={basicInfoBtn}
                        variant="fill"
                        type="submit"
                      >
                        Save Changes
                      </WxButton>
                    )}
                  </div>
                ) : (
                  <WxButton
                    className="wx__me-4"
                    onClick={() => setEditBasicInfo(true)}
                  >
                    Edit
                  </WxButton>
                )}
              </div>
              <WxHr />
              {editBasicInfo ? (
                <div className="wx__userBasic_info wx__row">
                  {infoLoading && <Preloader />}
                  <div className="wx__row wx__mb-3">
                    <div className="user_img wx__col-md-12">
                      <div className="img_wrapper">
                        <img
                          src={
                            watch("file")?.length
                              ? URL.createObjectURL(watch("file")[0])
                              : watch("image")
                              ? imageURLGenerate(watch("image").previewUrl)
                              : avatar
                          }
                          alt=""
                        />
                        <input
                          type="file"
                          name="images"
                          id="profileImage"
                          accept="image/png, image/jpg, image/jpeg"
                          style={{ display: "none" }}
                          {...register("file")}
                        />
                      </div>
                      <label htmlFor="profileImage" className="icon_wrapper">
                        <WxIcon icon="photo_camera" />
                      </label>
                      {!!watch("file") || !!watch("image") ? (
                        <p
                          onClick={() => {
                            setValue("file", null);
                            setValue("image", null);
                          }}
                          className="remove_text wx__text-danger wx__mb-0"
                        >
                          Remove Photo
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <WxInput
                    className="wx__col-sm-6"
                    label="First Name"
                    registerProperty={{
                      ...register("firstName"),
                    }}
                  />
                  <WxInput
                    className="wx__col-sm-6"
                    label="Last Name"
                    registerProperty={{
                      ...register("lastName"),
                    }}
                  />
                  <WxInput
                    className="wx__col-sm-6"
                    label="Email"
                    registerProperty={{
                      ...register("email"),
                    }}
                  />
                  <WxInput
                    className="wx__col-sm-6"
                    label="Phone Number"
                    registerProperty={{
                      ...register("phone"),
                    }}
                    // isDisabled={phone ? true : false}
                  />
                </div>
              ) : (
                <div className="wx__d-flex wx__align-items-center ">
                  <div className="account_img">
                    <img
                      src={
                        watch("image")
                          ? imageURLGenerate(watch("image").previewUrl)
                          : avatar
                      }
                      alt=""
                    />
                  </div>
                  <div className="wx__d-flex wx__flex-column wx__ms-2">
                    <p className="wx__text_body wx__text_strong wx__m-0">
                      {userBasicInfo?.firstName
                        ? userBasicInfo?.firstName +
                          " " +
                          userBasicInfo?.lastName
                        : "My Account"}
                      {/* {watch("firstName") || "No Name"} */}
                    </p>
                    {!isAccountVerified[0]?.active ? (
                      <span className="wx__text-primary wx__d-flex wx__align-items-center">
                        Verified <WxIcon icon="verified_user" />{" "}
                      </span>
                    ) : (
                      <span className="wx__text-danger wx__d-flex wx__align-items-center">
                        Unverified <WxIcon icon="gpp_maybe" />{" "}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </form>
            {!isAccountVerified[0]?.active || (
              <div className="verify_alert wx__d-flex wx__justify-content-between  wx__p-3 ">
                <div className="wx__d-flex wx__align-items-center">
                  <WxIcon icon="info" variants="outlined" />
                  <p className="wx__my-0 wx__ms-2 wx__text_body wx__text_medium">
                    Please verify your Phone Number to enjoy the complete WebX
                    experience .
                  </p>
                </div>
                <WxButton onClick={() => setOtpModal(true)} variant="fill">
                  Verify Phone Number
                </WxButton>
              </div>
            )}
          </div>
          {key !== "PPB_TRIAL" ? (
            <div className="wx__bg-white wx__rounded wx__mt-3 wx__p-4">
              <div className="wx__d-flex wx__align-items-center wx__justify-content-between">
                <h5 className="wx__mb-0">Affiliate Info</h5>
                <WxButton
                  disabled={
                    userBasicInfo?.isPartnerEnabled || isSubmittingEnablePartner
                  }
                  variant="fill"
                  onClick={enablePartner}
                >
                  Enable Partner
                </WxButton>
              </div>
              <WxHr className="wx__mb-0" />
              <div className="wx__row">
                <div className="wx__col-md-3 wx__mt-3">
                  <p className="wx__mb-2 wx__text_h6 wx__text_strong">
                    Referred By
                  </p>
                  <span className="wx__text_h5 wx__text_normal">
                    {userBasicInfo?.referredPartner || "No Partner"}
                  </span>
                </div>
                <div className="wx__col-md-9 wx__mt-3">
                  <p className="wx__mb-2 wx__text_h6 wx__text_strong">
                    Your Referral URL
                  </p>
                  <span className="wx__text_h6 wx__text_normal wx__text-primary">
                    {userBasicInfo?.partnerUrl ? (
                      <a href={userBasicInfo?.partnerUrl}>
                        {userBasicInfo?.partnerUrl}
                      </a>
                    ) : (
                      "No Partner Code"
                    )}
                    {userBasicInfo?.partnerUrl ? (
                      <WxIcon
                        className="wx__ms-2 material-icons wx__text-dark"
                        icon="content_copy"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            userBasicInfo?.partnerUrl
                          );
                          ToastService.success("Code Copied");
                        }}
                      />
                    ) : null}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          <form
            onSubmit={
              !userAddressEdit
                ? addressSubmit(createUserAddress)
                : addressSubmit(updateUserAddress)
            }
            className="wx__card wx__bg-white wx__p-3 wx__mt-3"
          >
            <div className="wx__row">
              <div className="wx__col-md-12 wx__col-sm-12 wx__d-flex wx__justify-content-between wx__align-items-center">
                <h5 className="wx__mb-0">Address & Contact</h5>
                {addressFlag ? (
                  <div className="wx__d-flex">
                    <WxButton
                      variant="none"
                      className="wx__me-4 cancel__btn"
                      onClick={() => {
                        setAddressFlag(false);
                        setUserAddressEdit(false);
                      }}
                    >
                      Cancel
                    </WxButton>
                    <WxButton type="submit" variant="none">
                      Save Changes
                    </WxButton>
                  </div>
                ) : (
                  <WxButton
                    variant="none"
                    onClick={() => {
                      addressReset({});
                      setAddressFlag(true);
                    }}
                  >
                    Add address
                  </WxButton>
                )}
              </div>
              <p className="wx__text_body wx__body_regular wx__mb-0">
                Used on customer order confirmations and your WebX bill.
              </p>
              <WxHr />
            </div>
            {addressFlag ? (
              <div className="wx__row">
                <div className="wx__col-md-12 wx__col-sm-12 wx__mt-2">
                  <WxInput
                    registerProperty={{
                      ...addressRegister("title", { required: true }),
                    }}
                    label="Address Title"
                    color={addressErrors.title ? "danger" : "primary"}
                    errorMessage={addressErrors.title && "Title is Required"}
                  />
                </div>
                <div className="wx__col-md-12 wx__col-sm-12 wx__mt-2">
                  <WxInput
                    label="Address Details"
                    noMargin
                    registerProperty={{
                      ...addressRegister("addressLine1"),
                    }}
                    color={addressErrors.addressLine1 ? "danger" : "primary"}
                    errorMessage={
                      addressErrors.addressLine1 && "Address is Required"
                    }
                  />
                </div>
                <div className="wx__col-md-12 wx__col-sm-12 wx__mt-2">
                  <WxInput
                    label="Appartment,  suits, etc"
                    noMargin
                    registerProperty={{ ...addressRegister("addressLine2") }}
                  />
                </div>
                <div className="wx__col-md-4 wx__col-sm-12 wx__mt-2">
                  <WxSelect
                    label="Division/State"
                    noMargin
                    options={divisions}
                    placeholder="Select Division"
                    valuesKey="object"
                    textKey="division_name_eng"
                    registerProperty={{
                      ...addressRegister("state", {
                        onChange: (e) => onChangeDivision(e.target.value),
                      }),
                    }}
                  />
                </div>
                <div className="wx__col-md-4 wx__col-sm-12 wx__mt-2">
                  <WxSelect
                    label="District/City"
                    options={districts}
                    placeholder="Select District/City"
                    valuesKey="zilla_name_eng"
                    textKey="zilla_name_eng"
                    defaultValue={addressWatch("cityName")}
                    key={addressWatch("cityName")}
                    registerProperty={{
                      ...addressRegister("cityName"),
                    }}
                    isDisabled={!districts?.length}
                  />
                </div>
                <div className="wx__col-md-4 wx__col-sm-12 wx__mt-2">
                  <WxInput
                    registerProperty={{
                      ...addressRegister("postCode"),
                    }}
                    label="Post code"
                    color={addressErrors?.postCode ? "danger" : "secondary"}
                    errorMessage={
                      addressErrors?.postCode && "Post Code is required!"
                    }
                  />
                </div>
                <div className="wx__col-md-12 wx__col-sm-12 wx__mt-2">
                  <WxInput
                    registerProperty={{
                      ...addressRegister("country"),
                    }}
                    label="Country"
                    defaultValue="Bangladesh"
                    className=""
                    isDisabled
                  />
                </div>
                <div className="wx__col-md-6 wx__col-sm-12 wx__mt-2">
                  <WxInput
                    label="Email Address"
                    type="email"
                    registerProperty={{
                      ...addressRegister("email", {
                        required: addressWatch("phone") ? false : true,
                      }),
                    }}
                    color={addressErrors?.email ? "danger" : "secondary"}
                    errorMessage={
                      addressErrors?.email && "Phone or Email is required"
                    }
                  />
                </div>
                <div className="wx__col-md-6 wx__col-sm-12 wx__mt-2">
                  <WxInput
                    label="Phone Number."
                    registerProperty={{
                      ...addressRegister("phone", {
                        required: addressWatch("email") ? false : true,
                      }),
                    }}
                    color={addressErrors?.phone ? "danger" : "secondary"}
                    errorMessage={
                      addressErrors?.phone && "Phone or Email is required"
                    }
                  />
                </div>
              </div>
            ) : (
              <>
                {userAddress.length !== 0 ? (
                  userAddress.map((user: any, i: number) => {
                    return (
                      <div className="wx__mb-2" key={user?.id}>
                        <div>
                          <div className="wx__d-flex wx__justify-content-between wx__align-items-center">
                            <div className="wx__d-flex wx__align-items-center wx__mb-2">
                              <WxIcon icon="contact_mail" />
                              <p className="wx__mb-0 wx__ms-1 wx__text_h6 wx__text_strong">
                                {user?.title}
                              </p>
                            </div>
                            <div className="wx__d-flex wx__justify-content-between">
                              <WxIcon
                                onClick={() => {
                                  getUserAddressById(user?.id);
                                  setUserAddressEdit(true);
                                }}
                                icon="edit"
                              />
                              <WxIcon
                                onClick={() => deleteUserAddressById(user?.id)}
                                icon="delete"
                                className="wx__text-danger"
                              />
                            </div>
                          </div>

                          <div className="wx__row">
                            <div className="wx__text_body d-flex align-items-center wx__mb-2">
                              <WxIcon icon="location_on" />
                              <span className="wx__text-secondary wx__ms-2">
                                {user?.addressLine1
                                  ? user?.addressLine1 + ", "
                                  : ""}
                                {user?.addressLine2
                                  ? user?.addressLine2 + ", "
                                  : ""}
                                {user?.cityName ? user?.cityName : ""}
                                {user?.postCode
                                  ? "-" + user?.postCode + ", "
                                  : " "}
                                {user?.state ? user?.state + ", " : ""}
                                {user?.country ? user?.country : ""}
                              </span>
                            </div>
                          </div>
                          <div className="wx__d-flex">
                            {user?.email && (
                              <div className="wx__text_body d-flex align-items-center wx__my-1">
                                <WxIcon icon="email" />
                                <div className="wx__d-flex wx__flex-column">
                                  <span className="wx__text-secondary wx__ms-2">
                                    {" "}
                                    {user?.email || ""}
                                  </span>
                                </div>
                              </div>
                            )}
                            {user?.phone && (
                              <div className=" wx__text_body d-flex align-items-center wx__ms-3">
                                <WxIcon icon="phone" />
                                <span className="wx__text-secondary wx__ms-2">
                                  {" "}
                                  {user?.phone || ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span className="wx__text-danger">No address available</span>
                )}
              </>
            )}
          </form>
          <form
            onSubmit={passHandleSubmit(passwordSubmit)}
            className="wx__p-4 wx__bg-white wx__mt-3 wx__rounded"
          >
            <div className="wx__d-flex wx__justify-content-between">
              <h5 className="wx__text_h5 wx__text_semibold wx__m-0">
                {changePassword ? "Change Password" : "Security"}
              </h5>
              {changePassword ? (
                <div className="wx__d-flex">
                  <WxButton
                    color="secondary"
                    className="wx__me-2"
                    onClick={() => setChangePassword(false)}
                  >
                    cancel
                  </WxButton>
                  {changePassword && (
                    <WxButton variant="fill" type="submit">
                      Save Changes
                    </WxButton>
                  )}
                </div>
              ) : (
                <div>
                  <WxButton onClick={() => setChangePassword(true)}>
                    Edit
                  </WxButton>
                </div>
              )}
            </div>
            <WxHr />
            {changePassword ? (
              isLoading ? (
                <Preloader />
              ) : (
                <div>
                  <WxInput
                    label="Current Password"
                    type="password"
                    // helpText={
                    //   <span className="wx__text-primary wx__text_medium wx__text_subtitle cursor-pointer">
                    //     Forgot Password?
                    //   </span>
                    // }
                    registerProperty={{
                      ...passRegister("old_password"),
                    }}
                    errorMessage={passErrors.old_password?.message}
                    color={passErrors.old_password ? "danger" : "secondary"}
                  />
                  <WxInput
                    label="New Password"
                    type="password"
                    registerProperty={{
                      ...passRegister("new_password"),
                    }}
                    errorMessage={passErrors.new_password?.message}
                    color={passErrors.new_password ? "danger" : "secondary"}
                  />
                  <WxInput
                    label="Confirm New Password"
                    type="password"
                    registerProperty={{
                      ...passRegister("cnf_new_password"),
                    }}
                    errorMessage={passErrors.cnf_new_password?.message}
                    color={passErrors.cnf_new_password ? "danger" : "secondary"}
                  />
                </div>
              )
            ) : (
              <div className="wx__d-flex wx__flex-column">
                <p className="wx__text_body wx__text_strong">Password</p>
                <span className="wx__text_small">********</span>
              </div>
            )}
          </form>
          {/* <div className="wx__rounded wx__p-4 wx__bg-white wx__mt-3">
            <div>
              <h5 className="wx__text_h5 wx__text_semibold">Stores</h5>
              <span className="wx__text_body wx__text-secondary">
                Visit or manage the following stores and resources to your WebX
                account
              </span>
            </div>
            <WxHr />
            <h4 className="text-center text-danger">No Stores</h4>
          </div> */}
        </div>
      </div>
      {otpModal && <EnterOTPModal show={otpModal} setShow={setOtpModal} />}
    </WxMainMd>
  );
};

export default AccountSetting;
// webxdev.xyz/register?ref=5f5e11b
