import DateInput from "@components/DatePicker/DateInput";
import WxSelect from "@components/Select/WxSelect";
import WxButton from "@components/WxButton";
import WxCheckbox from "@components/WxCheckbox";
import WxHr from "@components/WxHr";
import WxIcon from "@components/WxIcon/WxIcon";
import WxInput from "@components/WxInput";
import WxLabel from "@components/WxLabel";
import WxTextarea from "@components/WxTextarea";
import { yupResolver } from "@hookform/resolvers/yup";
import { CAMPAIGNS } from "routes/path-name.route";
import { MarketingService } from "services/api/marketing/Marketing.service";
import { ToastService } from "services/utils/toastr.service";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import * as yup from "yup";
import "./Campaign.scss";

const campaignStatusList = [
  { id: 0, title: "Draft" },
  { id: 1, title: "Submit" },
  { id: 2, title: "Approved" },
];

interface FormFiled {
  //   id: string;
  name: string;
  deliveryTime: string | Date;
  status: string;
  smsBody: string;
  //   expectedAudience: number;
  //   storeId: string;
  audienceIds: any[string];
}

const SMSCampaignForm = ({ isSaving, setIsSaving }) => {
  const [audienceList, setAudienceList] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [paginationLimit, setPaginationLimit] = useState(10);
  const location = useLocation();
  const [campaign] = useState<any>(location.state || {});
  const [checkedData, setCheckedData] = useState<any[]>(
    campaign.audiences || []
  );
  const [ifUpdate] = useState<boolean>(
    location.pathname.split("/").includes("update")
  );
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<number>(
    Number(searchParams.get("page"))
      ? Number(searchParams.get("page")) - 1
      : null || 0
  );

  const {
    handleSubmit,
    register,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormFiled>({
    resolver: yupResolver(
      yup.object().shape({
        name: yup.string().required("please enter campaign name"),
        smsBody: yup.string().required("please enter sms body"),
        status: yup.string().required("please select campaign status"),
        deliveryTime: yup
          .string()
          .required("please select campaign delivery time"),
        audienceIds: yup
          .array()
          .required("please select targeted audience")
          .nullable(),
      })
    ),
    defaultValues: {
      name: campaign?.name,
      smsBody: campaign?.smsBody,
      status: campaign?.status,
      deliveryTime: new Date(campaign?.deliveryTime),
      audienceIds: campaign?.audienceIds?.map((item) => item) || [],
    },
  });

  useEffect(() => {
    getAudienceList();
  }, []);

  const getAudienceList = () => {
    MarketingService.getAudienceList({
      body: {},
      meta: {
        sort: [
          {
            order: "desc",
            field: "createdOn",
          },
        ],
      },
    }).then((res) => {
      // setCheckedData()
      setAudienceList(res.body);
    });
  };

  const onSubmitting = (data: any) => {
    setIsSaving(true);

    if (ifUpdate) {
      MarketingService.updateSMSCampaign({
        ...data,
        deliveryTime: new Date(data.deliveryTime),
        audienceIds: checkedData.map((item) => item),
      })
        .then((res) => {
          navigate(CAMPAIGNS + "?type=" + searchParams.get("campaigns"));
        })
        .catch((err) => {
          ToastService.error(err.message);
        })
        .finally(() => setIsSaving(false));
      return;
    }
    MarketingService.createSMSCampaign({
      ...data,
      deliveryTime: new Date(data.deliveryTime),
      audienceIds: checkedData.map((item) => item),
    })
      .then((res) => {
        navigate(CAMPAIGNS + "?type=" + searchParams.get("campaigns"));
      })
      .catch((err) => ToastService.error(err))
      .finally(() => setIsSaving(false));
  };

  // handle selected audience
  const handleSelectedAudience = (data) => {
    const exists = checkedData.some((item) => item === data.id);
    console.log(exists);
    if (exists) {
      setCheckedData((state) => state.filter((item) => item !== data.id));
      return;
    }
    setCheckedData((state) => [...state, data.id]);
  };

  // console.log(campaign);

  return (
    <form className="wx__mt-3" onSubmit={handleSubmit(onSubmitting)} noValidate>
      <div className="wx__row ">
        <div className="wx__col-md-12 wx__col-lg-8 wx__col-sm-12">
          <div className="wx__card wx__p-4 wx__mb-3">
            <div className="wx__row">
              <div className="wx__col-md-12 wx__col-lg-12">
                <WxInput
                  label="Campaign Name"
                  registerProperty={{
                    ...register("name"),
                  }}
                  placeholder="write here"
                  isRequired
                  color={errors?.name ? "danger" : "secondary"}
                  errorMessage={errors?.name?.message}
                />
              </div>

              <div className="wx__col-lg-6 wx__col-md-12 wx__col-sm-6">
                <Controller
                  control={control}
                  name="status"
                  rules={{ required: false }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <WxSelect
                      label="Set campaigns status"
                      options={campaignStatusList}
                      placeholder="status"
                      valuesKey="title"
                      textKey="title"
                      isRequired
                      value={value}
                      onChange={onChange}
                      isDisabled={!campaignStatusList?.length}
                      color={errors?.status?.message ? "danger" : "secondary"}
                      errorMessage={error && "please select campaign status"}
                    />
                  )}
                />
              </div>
              <div className="wx__col-lg-6 wx__col-md-12 wx__col-sm-6">
                <DateInput
                  // date={watch("requested_delivery_time")}
                  date={watch("deliveryTime")}
                  setDate={(val) => setValue("deliveryTime", val)}
                  label="Requested Delivery time"
                  registerProperty={{
                    ...register("deliveryTime"),
                  }}
                  endIcon={<WxIcon variants="round" icon="calendartoday" />}
                  errorMessage={errors.deliveryTime?.message}
                  color={errors.deliveryTime ? "danger" : "secondary"}
                  // minDate={
                  //   new Date(new Date().setDate(new Date().getDate() + 1))
                  // }
                />
              </div>
            </div>
          </div>
          <div className="wx__card wx__p-4 wx__mb-3">
            <div className="wx__row">
              <h6 className="wx__text_h6 wx__text_semibold">Address</h6>
              <div className="wx__col-md-12 wx__col-lg-12">
                <WxLabel
                  isRequired
                  children="SMS BODY"
                  labelRight={
                    <span className="wx__text_subtitle wx__text_semibold">
                      TOTAL SMS 3
                    </span>
                  }
                />

                <WxTextarea
                  registerProperty={{
                    ...register("smsBody"),
                  }}
                  placeholder="write here"
                  isRequired
                  color={errors?.smsBody ? "danger" : "secondary"}
                  errorMessage={errors?.smsBody?.message}
                  helpText="150/250"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="wx__col-lg-4 wx__col-md-12 wx__col-sm-12">
          <div className="wx__card wx__p-4 wx__mb-3">
            <WxButton disabled={isSaving} type="submit" variant="fill">
              Launch Campaign
            </WxButton>
            <WxHr />
            {!watch("audienceIds") && errors.audienceIds ? (
              <span className="wx__text-danger wx__my-2">
                {errors?.audienceIds?.message}
              </span>
            ) : null}
            <div className="wx__audience_list">
              {audienceList.map((item, indx) => {
                return (
                  <WxCheckbox
                    key={item.id}
                    className="wx__product_list_in_select_product_drawer"
                    onChange={(e) => {
                      handleSelectedAudience(item);
                    }}
                    checked={checkedData.some((checkId) => checkId === item.id)}
                    label={
                      <span
                        className={`${
                          !watch("audienceIds") && errors?.audienceIds
                            ? "wx__text-danger"
                            : null
                        }`}
                      >
                        {item.title}
                      </span>
                    }
                  />
                );
              })}
            </div>

            <WxHr />
            <div>
              <h6 className=" wx__mb-0 wx__text_strong">250</h6>
              <span className="wx__text_small ">Total Audience Size</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SMSCampaignForm;
