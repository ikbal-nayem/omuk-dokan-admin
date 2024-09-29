import { ConfirmationModal } from "@components/ConfirmationModal/ConfirmationModal";
import WxMainLg from "@components/MainContentLayout/WxMainLg";
import WxButton from "@components/WxButton";
import { WxFormHeader } from "@components/WxFormLayout";
import WxHr from "@components/WxHr";
import WxIcon from "@components/WxIcon/WxIcon";
import WxSwitch from "@components/WxSwitch";
import { MASTER_META_KEY } from "config/constants";
import { ISenderEmail } from "@interfaces/common.interface";
import {
  INotificationSettings,
  IRateInfo,
} from "@interfaces/Settings.interface";
import {
	PAYMENT,
	SETTINGS,
	SETTINGS_NOTIFICATION_ORDER,
} from "routes/path-name.route";
import { AdminService } from "services/api/admin/Admin.service";
import { EmailService } from "services/api/email/Email.service";
import { NotificationSettingService } from "services/api/settings/Notification.service";
import Preloader from "services/utils/preloader.service";
import { ToastService } from "services/utils/toastr.service";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import NotificationModal from "./Components/NotificationModal";
import "./Notification.scss";

const initValue = {
  buyNonMasking: {
    id: 1,
    heading: "Buy Non Masking SMS",
    inputLabel: "SMS Quantity",
    inputType: "number",
    buttonLabel: "Buy SMS",
    task: "BUY",
    masterMetaKey: MASTER_META_KEY.WEBX_SERVICES_NON_MASKING_SMS,
  },
  buyEmail: {
    id: 2,
    heading: "Buy Email",
    inputLabel: "Email Quantity",
    inputType: "number",
    buttonLabel: "Buy Email",
    task: "BUY",
    masterMetaKey: MASTER_META_KEY.WEBX_SERVICES_EMAIL,
  },
  updateEmail: {
    id: 3,
    heading: "Notification sender email",
    inputLabel: "Email",
    placeholder: "example@email.com",
    inputType: "email",
    buttonLabel: "Save",
    task: "UPDATE_EMAIL",
  },
};

const Notification = () => {
  const [rateInfo, setRateInfo] = useState<IRateInfo>();
  const [senderEmail, setSenderEmail] = useState<ISenderEmail>();
  const [notificationData, setNotificationsData] =
    useState<INotificationSettings>();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [data, setData] = useState<any>();
  const [isDialogeOpen, setIsDialogeOpen] = useState<boolean>(false);
  const [balance, setBalance] = useState(null);
  const invoiceId = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const balanceReq = NotificationSettingService.getBalanceByStoreId('storeId');
    const ratesReq = AdminService.getRates();
    Promise.all([balanceReq, ratesReq])
      .then(([balance, rates]) => {
        setRateInfo(rates.body);
        setBalance(balance.body);
      })
      .finally(() => setLoading(false));

    notificationReq();
    emailReq();
  }, []);

  const handleDialogeClose = () => {
    setIsDialogeOpen(false);
  };
  const handleGetwayClose = () => {
    invoiceId.current = null;
    setIsPaymentModalOpen(false);
  };

  const notificationReq = () => {
    NotificationSettingService.syncAndGet()
      .then((res) => setNotificationsData(res.body))
      .catch((err) => ToastService.error(err.message));
  };

  const emailReq = () => {
    EmailService.getMySenderEmail()
      .then((res) => setSenderEmail(res.body))
      .catch((err) => ToastService.error(err.message));
  };

  const onNotifigationSet = (
    notificationType: string,
    index: number,
    type: string,
    isChecked: boolean
  ) => {
    setIsSaving(true);
    let temp = notificationData;
    temp[notificationType][index][type] = isChecked;
    NotificationSettingService.update(temp)
      .then((res) => {
        setNotificationsData({ ...res.body });
      })
      .catch((err) => {
        ToastService.error(err.message);
        setNotificationsData({ ...notificationData });
      })
      .finally(() => setIsSaving(false));
  };

  const setDialogeIndex = (index) => {
    setData(initValue[index]);
    setIsDialogeOpen(true);
  };

  const handleDone = (type: string, value: any) => {
    if (type === "BUY") {
      invoiceId.current = value.invoiceId;
      setIsPaymentModalOpen(true);
    } else setSenderEmail(value);
    handleDialogeClose();
  };

  return (
    <div>
      <WxMainLg className="notification_sec">
        <WxFormHeader title="Notfication" backNavigationLink={SETTINGS} />
        <div className="wx__row">
          <div className="notification_left wx__col-lg-8 wx__col-md-12 wx__col-sm-12 wx__mt-3">
            <div className="wx__card wx__p-4">
              <div className="wx__row">
                <div className="wx__col-md-12 wx__col-sm-12">
                  <h6 className="wx__mb-4">Order Notifications</h6>
                  {loading ? <Preloader /> : null}
                  {notificationData?.orderNotifications?.map((order, index) => {
                    return (
                      <div className="single_notification" key={order?.id}>
                        <div className="wx__d-flex wx__justify-content-between wx__align-items-center wx__text_body wx__text_medium ">
                          <p className="wx__mb-0 wx__text_body wx__text_medium notification_title">
                            {order?.description || order?.title}
                          </p>
                          <div className="wx__d-flex ">
                            <div className="wx__d-flex wx__me-5">
                              <WxSwitch
                                isChecked={order?.sms}
                                onChange={(e) =>
                                  onNotifigationSet(
                                    "orderNotifications",
                                    index,
                                    "sms",
                                    e.target.checked
                                  )
                                }
                                disabled={isSaving}
                              />
                              <span>SMS</span>
                            </div>
                            <div className="wx__d-flex">
                              <WxSwitch
                                isChecked={order?.email}
                                onChange={(e) =>
                                  onNotifigationSet(
                                    "orderNotifications",
                                    index,
                                    "email",
                                    e.target.checked
                                  )
                                }
                                disabled={isSaving}
                              />
                              <span>Email</span>
                            </div>
                          </div>
                        </div>
                        {notificationData?.orderNotifications?.length - 1 ===
                        index ? null : (
                          <WxHr />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="wx__card wx__p-4 wx__mt-4">
              <div className="wx__row">
                <div className="wx__col-md-12 wx__col-sm-12">
                  <h6 className="wx__mb-4">Account Notifications</h6>
                  {loading ? <Preloader /> : null}
                  {notificationData?.accountNotifications?.map(
                    (account, index) => {
                      return (
                        <div className="single_notification" key={account?.id}>
                          <div className="wx__d-flex wx__justify-content-between wx__align-items-center wx__text_body wx__text_medium">
                            <p className="wx__mb-0 wx__text_body wx__text_medium notification_title">
                              {account.description || account.title}
                            </p>
                            <div className="wx__d-flex ">
                              <div className="wx__d-flex wx__me-5">
                                <WxSwitch
                                  isChecked={account?.sms}
                                  onChange={(e) =>
                                    onNotifigationSet(
                                      "accountNotifications",
                                      index,
                                      "sms",
                                      e.target.checked
                                    )
                                  }
                                  disabled={isSaving}
                                />
                                <span>SMS</span>
                              </div>
                              <div className="wx__d-flex">
                                <WxSwitch
                                  isChecked={account?.email}
                                  onChange={(e) =>
                                    onNotifigationSet(
                                      "accountNotifications",
                                      index,
                                      "email",
                                      e.target.checked
                                    )
                                  }
                                  disabled={isSaving}
                                />
                                <span>Email</span>
                              </div>
                            </div>
                          </div>
                          {notificationData?.accountNotifications?.length -
                            1 ===
                          index ? null : (
                            <WxHr />
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="notification_right wx__col-lg-4 wx__col-md-12 wx__col-sm-12 wx__mt-3">
            <div className="wx__card wx__p-4 wx__d-flex wx__justify-content-center">
              <div className="wx__d-flex wx__justify-content-between wx__mb-3">
                <div>
                  <h6 className="wx__text_heading wx__text_medium">
                    SMS Balance
                  </h6>
                  {/* <div className="wx__mb-2">
										<span className="wx__text-muted">Masking</span>
										<h2 className="wx__text_heading wx__text_strong wx__mb-0">
											{balance?.maskingSms || "0"}
										</h2>
									</div> */}
                  <div>
                    {/* <span className="wx__text-muted">Non Masking</span> */}
                    <h2 className="wx__text_heading wx__text_strong wx__mb-0">
                      {balance?.nonMaskingSms || "0"}
                    </h2>
                  </div>
                </div>
                <div className="icon_megenta">
                  <WxButton
                    type="button"
                    variant="none"
                    onClick={() =>
                      navigate(SETTINGS_NOTIFICATION_ORDER, { state: 2 })
                    }
                  >
                    <WxIcon icon="sms" />
                  </WxButton>
                </div>
              </div>
              <WxButton
                type="button"
                variant="outline"
                disabled={!rateInfo}
                onClick={() => setDialogeIndex("buyNonMasking")}
              >
                Buy SMS
              </WxButton>
              <p className="wx__text_small wx__text_regular wx__text-center wx__mt-2 wx__mb-0">
                Current SMS rate {rateInfo?.nonMaskingSmsRate} paisa/SMS
              </p>
            </div>
            <div className="wx__card wx__p-4 wx__mt-3 wx__d-flex wx__justify-content-center">
              <div className="wx__d-flex wx__justify-content-between wx__mb-3">
                <div>
                  <h6 className="wx__text_heading wx__text_medium">
                    Email Balance
                  </h6>
                  <h2 className="wx__text_heading wx__text_strong wx__mb-0">
                    {balance?.email || "0"}
                  </h2>
                </div>
                <div className="icon_megenta">
                  <WxButton
                    type="button"
                    variant="none"
                    onClick={() =>
                      navigate(SETTINGS_NOTIFICATION_ORDER, { state: 1 })
                    }
                  >
                    <WxIcon icon="email" />
                  </WxButton>
                </div>
              </div>
              <WxButton
                type="button"
                variant="outline"
                disabled={!rateInfo}
                onClick={() => setDialogeIndex("buyEmail")}
              >
                Buy Email
              </WxButton>
              <p className="wx__text_small wx__text_regular wx__text-center wx__mt-2 wx__mb-0">
                Current SMS rate {rateInfo?.emailRate} paisa/SMS
              </p>
              <WxHr />
              <div className="wx__d-flex wx__align-items-center wx__justify-content-between">
                <p className="wx__text_subtitle wx__text_semibold wx__mb-0">
                  Email to be used
                </p>
                <WxButton
                  type="button"
                  variant="none"
                  onClick={() => setDialogeIndex("updateEmail")}
                >
                  {senderEmail ? "Edit" : "Add"}
                </WxButton>
              </div>
              <p className="wx__text_body wx__text_regular wx__mb-0">
                {loading ? (
                  <Preloader />
                ) : (
                  senderEmail?.email || "No sender email found!"
                )}
              </p>
            </div>
          </div>
        </div>
      </WxMainLg>
      <NotificationModal
        isModalOpen={isDialogeOpen}
        rateInfo={rateInfo}
        handleDialogeClose={handleDialogeClose}
        handleDone={handleDone}
        data={data}
        senderEmail={senderEmail}
      />
      <ConfirmationModal
        confirmType="primary"
        title="Order placed successfully"
        onConfirmLabel="Pay Now"
        isOpen={isPaymentModalOpen}
        onClose={handleGetwayClose}
        onConfirm={() => navigate(PAYMENT + "?invoiceId=" + invoiceId.current)}
        body={
          <p>
            Order has been placed successfully. <br /> Please pay first to take
            effect on balance.
          </p>
        }
      />
    </div>
  );
};
export default Notification;
