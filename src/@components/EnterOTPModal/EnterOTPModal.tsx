import {Button} from "@components/Button";
import WxHr from "@components/WxHr";
import Icon from "@components/Icon";
import TextInput from "@components/TextInput";
import WxModal from "@components/Modal";
import WxModalBody from "@components/Modal/ModalBody";
import WxModalFooter from "@components/Modal/ModalFooter";
import WxModalHeader from "@components/Modal/ModalHeader";
import { AccountSettingService } from "services/api/AccountSetting.service";
import { LocalStorageService } from "services/utils/local-storage.service";
import { ToastService } from "services/utils/toastr.service";
import { useState } from "react";
import { useForm } from "react-hook-form";
import "./EnterOTPModal.scss";

interface IModal {
  show: boolean;
  setShow: any;
}

const EnterOTPModal = ({ show, setShow }: IModal) => {
  const userData: any = LocalStorageService.get("user_data") || {};

  const { phone }: any = userData;
  const [sendingThrough, setSendingThrough] = useState<string>(phone);

  const [numberEdit, setNumberEdit] = useState<boolean>(true);

  const [isVisibleResend, setIsVisibleResend] = useState(false);

  const [sendOTP, setSendOTP] = useState<boolean>(true);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [btnDisable, setBtnDisable] = useState<boolean>(false);

  const [timer, setTimer] = useState("");

  // const todo = {
  //   accountVerified: "NO",
  //   needFirstProduct: "YES",
  //   needMainDomain: "YES",
  //   needPaymentGateway: "NO",
  // };

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();

  const handleOTPService = (data) => {
    setBtnDisable(true);

    if (sendOTP) {
      handleOTP(data.sendingThrough);
    } else {
      // otp verification
      const todo: any = LocalStorageService.get("todo") || [];
      setValue("otp", "");
      AccountSettingService.verifyOTP({
        // username: getValues("sendingThrough"),
        otp: data.otp,
      })
        .then((res) => {
          ToastService.success(res.message);
          setShow(false);

          // finding the index of isAccountVerified
          const index = todo.findIndex((item) => item["isAccountVerified"]);

          if (index !== -1) {
            // updating the value
            const newArr = [
              ...todo,
              { ...todo[index], isAccountVerified: "YES", active: false },
            ];
            LocalStorageService.set("todo", newArr);
          }

          updateProfile(sendingThrough);
        })
        .catch((err) => ToastService.error(err.message))
        .finally(() => setBtnDisable(false));
    }
  };

  const handleOTP = (sendAt) => {
    LocalStorageService.set("otpExp", addSeconds(150));
    AccountSettingService.sendOTP({
      username: sendAt,
    })
      .then((res) => {
        ToastService.success(res.message);
        onCountDown();
        setSendOTP(false);
        setOtpSent(true);
        setValue("otp", "");
        setSendingThrough(sendAt);
      })
      .catch((err) => ToastService.error(err.message))
      .finally(() => setBtnDisable(false));
  };

  const updateProfile = (phone: string | number) => {
    const formData = new FormData();
    formData.append(
      "body",
      JSON.stringify({
        ...userData,
        phone: phone,
      })
    );
    AccountSettingService.updateProfile(formData)
      .then((res) => {
        LocalStorageService.set("user_data", {
          ...userData,
          phone: phone,
        });
      })
      .catch((err) => ToastService.error);
    return;
  };

  const addSeconds = (seconds: number) => {
    let d;
    d = new Date();
    d.setSeconds(d.getSeconds() + seconds);
    return d;
  };

  const onCountDown = () => {
    setIsVisibleResend(false);

    const otpExp = LocalStorageService.get("otpExp") || new Date();

    // Set the date we're counting down to
    var countDownDate = new Date(otpExp).getTime();

    // Update the count down every 1 second
    const x = setInterval(function () {
      // Get today's date and time
      const now = new Date().getTime();

      // Find the distance between now and the count down date
      const distance = countDownDate - now;
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      seconds >= 0 &&
        setTimer(`${minutes}:${seconds >= 10 ? seconds : "0" + seconds}`);

      if (distance < 0) {
        clearInterval(x);
        setIsVisibleResend(true);
      }
    }, 1000);
  };

  return (
    <>
      <WxModal show={show} size="md" handleClose={setShow}>
        <WxModalHeader
          title=""
          onClickClose={setShow}
          className="border-0"
        />
        <WxModalBody>
          <form onSubmit={handleSubmit(handleOTPService)}>
            {sendOTP ? (
              <div className="enter_otp">
                <h5>Send OTP</h5>
                <WxHr />
                <div>
                  <div>
                    <TextInput
                      label="OTP will be send in this number below"
                      placeholder="Type your phone number"
                      type="number"
                      isRequired
                      registerProperty={{
                        ...register("sendingThrough", {
                          required: true,
                          onChange: () => setOtpSent(false),
                        }),
                      }}
                      defaultValue={sendingThrough}
                    />
                    <Button
                      disabled={btnDisable || otpSent}
                      type="submit"
                      variant="fill"
                      width={100}
                    >
                      Send OTP
                    </Button>
                    {otpSent && (
                      <Button
                        className="mt-2"
                        variant="fill"
                        width={100}
                        onClick={() => setSendOTP(false)}
                      >
                        Back to Submit OTP
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="enter_otp">
                <h5>Enter OTP</h5>
                <WxHr />
                <div>
                  <div>
                    <TextInput
                      label="One Time Password"
                      placeholder="Type OTP here"
                      type="number"
                      isRequired
                      registerProperty={{
                        required: true,
                        ...register("otp"),
                      }}
                    />

                    <Button
                      disabled={btnDisable}
                      type="submit"
                      variant="fill"
                      width={100}
                    >
                      Confirm OTP
                    </Button>
                    {/* <Button
                    className="mt-2"
                    color="secondary"
                    variant="fill"
                    width={100}
                    onClick={() => setSendOTP(true)}
                  >
                    Back to Edit Number
                  </Button> */}

                    <p className="text_body">
                      OTP sent to this number{" "}
                      <span className="text-primary">
                        {getValues("sendingThrough")}
                      </span>
                      <Icon
                        className="ms-1"
                        onClick={() => setSendOTP(true)}
                        icon="edit"
                      />
                    </p>
                    <br />
                    <span className="text-secondary text_medium text-center mt-3 d-flex align-items-center">
                      Didn't get OTP?{" "}
                      {!isVisibleResend && "Resend OTP in " + timer}
                      {/* {timer ? "Resend OTP in " + timer : <span>Resend</span>} */}
                      {isVisibleResend && (
                        <Button
                          className="mt-2 ms-3"
                          variant="fill"
                          // type="submit"
                          onClick={() => handleOTP(getValues("sendingThrough"))}
                        >
                          Resend OTP
                        </Button>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </WxModalBody>
        <WxModalFooter className="bg-white">
          <div className="d-flex justify-content-between">
            <Button
              variant="outline"
              color="secondary"
              onClick={() => setShow(false)}
            >
              Cancel
            </Button>
          </div>
        </WxModalFooter>
      </WxModal>
      {/* <DevTool control={control} /> */}
    </>
  );
};

export default EnterOTPModal;
