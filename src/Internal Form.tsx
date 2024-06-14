/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import './AdministrativeClosing.scss';

import AgentApiConstants from '@agent/constant/AgentApiConstants';
import Appconstants from '@constants/AppConstants';
import { useLangContext } from '@context/LangContext';
import { useLoadingContext } from '@context/LoadingContext';
import { Checkbox, DatePickerV1 } from '@form/index';
import validation from '@form/validator';
import { Trans, useTranslation } from '@i18n';
import Modalwrapper from '@individual/modules/Common/Modal';
import { Back } from '@individual/modules/Common/PageLevelBanners/wrapper';
import TableWrapper from '@individual/modules/Common/TableWrapper';
import { AccordionGroup, Button, Panel } from '@optum';
import { default as AppUtils, default as Utils } from '@utils/Apputils';
import request from '@utils/request';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
const config = {
  columns: [
    { label: 'adminclosure, adminReason', key: 'reason' },
    { label: 'adminclosure.effectiveDate', key: 'effectiveDate' },
    { label: 'adminclosure.endDate', key: 'endDate' },
  ],
};
interface AdminClosure {
  disableOnUI?: any;
  reason: string;
  status?: string;
  effectiveDate?: string;
  endDate?: string;
  isRemoved?: boolean;
  idx: any;
  fullName: any;
}

interface MemberDetails {
  fullName: string;
  memberReferenceId: string;
  adminClosure: AdminClosure[];
}

const convertDefaultValues = (values, comment) => {
  if (Array.isArray(values)) {
    return values.reduce((acc, item) => {
      const key = item.fullName;
      if (key) {
        acc[key] = {
          ...item,
          adminClosures: item.adminClosures.reduce((closureAcc, closure) => {
            closureAcc[closure.reason] = {
              ...closure,
              effectiveDate: closure.effectiveDate || null,
              isModalCheckBoxSelected:
                closure.status === 'DRAFT' || closure.status === 'APPLIED',
            };
            return closureAcc;
          }, {}),
        };
      }
      acc['comment'] = comment;
      return acc;
    }, {});
  }
  return values;
};

const InternalForm = ({
  adminClosureMemberDetails,
  isLoading = false,
  add,
  setFormErrors,
  setNoData,
}) => {
  // Add reset below
  const { watch, setValue, register, handleSubmit, getValues, reset } = useFormContext();
  const { lang } = useLangContext();
  const [showWarningPopUp, setShowWarningPopUp] = useState(false);
  //   const [selectedReasons, setSelectedReasons] = useState<AdminClosure[]>([]);
  //   const [clickedBtn, setClickedBtn] = useState(null);
  const draft = useRef(null);
  const reRun = useRef(null);
  //   Change to string
  const [currentMember, setCurrentMember] = useState<string | null>(null);
  const [showPopUp, setShowPopUp] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [comment, setComment] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showDefaultloading, hideLoading } = useLoadingContext();
  // Add new state
  const backUpFormState = useRef(null);

  useEffect(() => {
    if (adminclosureMemberDetails && adminclosureMemberDetails?.length === 0) {
      add({
        hasDismiss: false,
        variant: 'errorTop',
        css: 'errorTop. mb-xs',
        View: () => (
          <>
            <Trans label="adminClosure.noDataAdminClosure" />
          </>
        ),
      });
      setNoData(true);
    }
    // ---------------- removed else part --------------
  }, [adminClosureMemberDetails]);

  const back = () => {
    navigate(-1);
  };

  //   const handleDateChange = useCallback(
  //     (fullName, idx, keyName, newValue) => {
  //       setMemberClosures((mc: any) => {
  //         const initialclosures = JSON.parse(JSON.stringify(mc));
  //         initialclosures[fullName].adminclosures[idx][keyName] = newValue;
  //         return initialclosures;
  //       });
  //     },
  //     [memberClosures],
  //   );

  // Changes done here:
  const handleSaveRerun = async () => {
    showDefaultloading();
    // const adminClosureMemberRequest = Object.entries(memberClosures).map(
    //   ([memberName, Closures]) => {
    //     const member = adminClosureMemberDetails.find((m) => m.fullName === memberName);
    //     return {
    //       memberReferenceId: member.memberReferenceId,
    //       adminClosure: closures.adminClosures
    //         .filter(
    //           (closure) => closure.status === 'APPLIED' || closure.status === 'DRAFT',
    //         )
    //         .map((C) => ({
    //           reason: c.reason,
    //           effectiveDate: c.effectiveDate,
    //           endDate: c.endDate,
    //           disableOnUI: c.disableOnUI,
    //           isRemoved: c.isRemoved,
    //         })),
    //     };
    //   },
    // );

    const adminClosureMemberRequest = Object.values(getValues('memberData')).map(
      ({ memberReferenceId, adminClosures }: any) => ({
        memberReferenceId: memberReferenceId,
        adminClosure: Object.values(adminClosures)
          .filter((closure) => closure.status === 'APPLIED' || closure.status === 'DRAFT')
          .map((closure) => ({
            reason: closure.reason,
            effectiveDate: closure.effectiveDate,
            endDate: closure.endDate,
            disableOnUI: closure.disableOnUI,
            isRemoved: closure.isRemoved,
          })),
      }),
    );
    try {
      const requestBody = {
        adminClosureMemberRequest: [...adminClosureMemberRequest],
        comment: comment,
      };
      const response = await request(
        AgentApiConstants.ADMINISTRATIVE_CLOSING.saveReRun(),
        {
          body: requestBody,
        },
      );
      if (response && !response?.subErrors) {
        add({
          hasDismiss: false,
          variant: 'success',
          timeout: 5000,
          css: 'success mb-xs address-update-banner',
          View: () => (
            <>
              <Trans label="adminClosure.success" />
            </>
          ),
        });
        console.log('save response', response);
      } else {
        console.log('Save res', response);
      }
    } catch (error) {
      console.log('Save error', error);
    }
    hideLoading();
  };

  // Changes done here:
  const handleSaveAsDraft = async () => {
    setShowWarningPopUp(fasle);
    showDefaultloading();
    // const adminClosureMemberRequest = Object.entries(memberClosures).map(
    //   ([memberName, closures]) => {
    //     const member = adminClosureMemberDetails.find((m) => m.fullName === memberName);

    //     return {
    //       memberReferenceId: member.memberReferenceId,
    //       adminClosures: closures.adminClosures
    //         .filter(
    //           (closure) => closure.status === 'APPLIED' || closure.status === 'DRAFT',
    //         )
    //         .map((c) => ({
    //           reason: c.reason,
    //           effectiveDate: c.effectiveDate,
    //           endDate: c.endDate,
    //           disableOnUI: c.disableOnUI,
    //           isRemoved: c.isRemoved,
    //         })),
    //     };
    //   },
    // );

    const adminClosureMemberRequest = Object.values(getValues('memberData')).map(
      ({ memberReferenceId, adminClosures }: any) => ({
        memberReferenceId: memberReferenceId,
        adminClosure: Object.values(adminClosures)
          .filter((closure) => closure.status === 'APPLIED' || closure.status === 'DRAFT')
          .map((closure) => ({
            reason: closure.reason,
            effectiveDate: closure.effectiveDate,
            endDate: closure.endDate,
            disableOnUI: closure.disableOnUI,
            isRemoved: closure.isRemoved,
          })),
      }),
    );
    try {
      const requestBody = {
        adminClosureMemberRequest: [...adminClosureMemberRequest],
        comment: comment,
      };
      const draftData = await request(
        AgentApiConstants.ADMINISTRATIVE_CLOSING.saveDraft(),
        {
          body: requestBody,
        },
      );
      if (draftData && !draftData?.subErrors) {
        console.log('Draft response', draftData);
        add({
          hasDismiss: false,
          variant: 'success',
          timeout: 5000,
          css: 'success mb-xs address-update-banner',
          View: () => (
            <>
              <Trans label="adminClosure.success" />
            </>
          ),
        });
      } else {
        console.log('Draft res', draftData);
      }
    } catch (error) {
      console.log('Draft error', error);
      add({
        hasDismiss: false,
        variant: 'success',
        timeout: 5000,
        css: 'success mb-xs address-update-banner',
        View: () => (
          <>
            <Trans label="adminClosure.successDraft" />
          </>
        ),
      });
    }
    hideLoading();
  };

  //   Changes done
  const handleAddReasonClick = (fullName) => {
    backUpFormState.current = getValues();
    setCurrentMember(fullName);
    setShowPopUp(true);
  };

  //   const handleReasonChange = (reason: AdminClosure, checked: boolean) => {
  //     const key = `$(currentMember .memberReferenceId}.${reason.reason.slice(0, 2)}`;
  //     setValue(key, !watch(key));
  //     setSelectedReasons((prevSelectedReasons) => {
  //       if (prevSelectedReasons?.some((r) => r.reason === reason.reason)) {
  //         return prevSelectedReasons?.filter((r) => r.reason !== reason.reason);
  //       } else {
  //         return [
  //           ...prevSelectedReasons,
  //           {
  //             reason: reason.reason,
  //             fullName: reason.fullName,
  //             idx: reason.idx,
  //           },
  //         ];
  //       }
  //     });
  //   };

  //   seems no change required here
  const handleRowSelectionChange = (fullName, reason: string) => {
    setValue(`check-${reason}`, !watch(`check-${reason}`));
    setSelectedRows((prev) => {
      const memberRows = prev[fullName] || [];
      if (memberRows.includes(reason)) {
        return {
          ...prev,
          [fullName]: memberRows.filter((r) => r !== reason),
        };
      } else {
        return {
          ...prev,
          [fullName]: [...memberRows, reason],
        };
      }
    });
  };

  const handleAddReasonToTable = ({ reset, dismiss }) => {
    setShowPopUp(false);
    reset();
    dismiss();
  };

  //  Inprogress
  const handleRemoveSelectedReasons = async (fullName: string) => {
    const updatedClosures = memberClosures[member?.fullName].adminClosures
      .filter((closure) => closure.status === 'APPLIED' || closure.status === 'DRAFT')
      .map((closure) => {
        if (selectedRows[member?.fullName].includes(closure.reason)) {
          return { ...closure, isRemoved: true };
        }
        return closure;
      });
    setMemberClosures((prevClosures) => ({
      ...prevClosure,
      [member?.fullName]: {
        ...prevClosures[member?.fullName],
        adminClosures: updatedClosures,
      },
    }));
    const checkRemove = selectedRows.some((reason) =>
      memberClosure[member?.fullName].adminClosure.some(
        (closure) => closure.reason === reason && closure.status === 'APPLIED',
      ),
    );
    if (!checkRemove) {
      showDefaultloading();
      try {
        const memberReferenceId = member?.memberReferenceId;
        const response = await request(
          AgentApiConstants.ADMINISTRATIVE_CLOSING.removeAdminClosure({
            memberReferenceId,
          }),
          {
            body: selectedRows,
          },
        );
        if (response && !response.subErrors) {
          add({
            hasDismiss: false,
            variant: 'success',
            timeout: 5000,
            css: 'success mb-xs address-update-banner',
            View: () => (
              <>
                <Trans label="adminClosure.success" />
              </>
            ),
          });
          console.log('remove if', response);
        } else {
          add({
            hasDismiss: false,
            variant: 'errorTop',
            css: 'errorTop. mb-xs',
            View: () => (
              <>
                <p> {response?.subErrors[0]?.defaultMessage}</p>
              </>
            ),
          });
          console.log('remove else', response);
        }
      } catch (error) {
        console.log('Error', error);
      }
    } else {
      add({
        hasDismiss: false,
        variant: 'errorTop',
        css: 'errorTop. mb-xs',
        View: () => (
          <>
            <Trans label="adminClosure.draftClosure" />
          </>
        ),
      });
    }
    setCurrentMember(null);
    setShowPopUp(false);
    hideLoading();
  };

  //   Prefix memberData in name
  const headings = useMemo(
    () => [
      ({ row: { reason = '', status = '', fullName } = {} }: any) => {
        return (
          <div>
            <Checkbox
              cmpFirst
              displayLabel={false}
              name={`tableCheckBox.${fullName}.${reason}`}
              label={`${reason}`}
              className="form-checkbox"
              checked={watch(`check-${reason}`)}
              onChange={({ target: { checked } }: any) => {
                handleRowSelectionChange(fullName, reason);
              }}
            />
            <span>
              {' '}
              {reason} {status === 'DRAFT' && <p> {t('adminClosure.draftText')}</p>}
            </span>
          </div>
        );
      },
      ({ row: { effectiveDate = '', reason = '', fullName, idx } = {} }: any) => {
        return (
          <div className="date-con">
            <Controller
              name={`memberData.${fullName}.adminClosures.${reason}.effectiveDate`}
              control={control}
              defaultValue={effectiveDate}
              render={({ field }) => (
                <DatePickerV1
                  {...field}
                  displayLabel={false}
                  name={`memberData.${fullName}.adminClosures.${reason}.effectiveDate`}
                  altName={`effectiveDate`}
                  defaultValue={effectiveDate}
                  validation={{ ...validation.isDateValid, ...validation.default }}
                  maxDate={AppConstants.DATE_FORMATS.MAX_DATE}
                  desc={true}
                  onChange={(newValue: any) => {
                    field.onChange(
                      AppUtils.addDateFormat(
                        newValue,
                        AppConstants.DATE_FORMATS.API_DATE_FORMAT,
                      ),
                    );
                    handleDateChange(
                      fullName,
                      idx,
                      'effectiveDate',
                      AppUtils.addDateFormat(
                        newValue,
                        AppConstants.DATE_FORMATS.API_DATE_FORMAT,
                      ),
                    );
                  }}
                  className="mb-20 form-aapn"
                />
              )}
            />
          </div>
        );
      },
      ({
        row: { endDate = '', reason = '', fullName, idx } = {},
        params: { lang },
      }: any) => {
        return (
          <div className="date-con">
            <Controller
              name={`memberData.${fullName}.adminClosures.${reason}.endDate`}
              control={control}
              defaultValue={endDate}
              render={({ field }) => (
                <DatePickerV1
                  displayLabel={false}
                  name={`${idx}.endDate`}
                  altName={`endDate`}
                  onChange={(newValue: any) => {
                    field.onChange(
                      AppUtils.addDateFormat(
                        newValue,
                        AppConstants.DATE_FORMATS.API_DATE_FORMAT,
                      ),
                    );
                    handleDateChange(
                      fullName,
                      idx,
                      'endDate',
                      AppUtils.addDateFormat(
                        newValue,
                        AppConstants.DATE_FORMATS.API_DATE_FORMAT,
                      ),
                    );
                  }}
                  desc={true}
                  className="mb-20 form-aapn"
                />
              )}
            />
          </div>
        );
      },
    ],
    [selectedRows, currentMember],
  );

  const onSubmitHandle = (buttonRef) => {
    if (buttonRef === 'draft') {
      handleSubmit(handleDraftClick)();
    } else if (buttonRef === 'reRun') {
      handleSubmit(handleSaveRerun)();
    }
  };

  const handleDraftClick = () => {
    setShowWarningPopup(true);
  };
  const confirmWarningPopup = () => {
    handleSaveAsDraft();
  };

  //   todo
  const handleCommentChange = (event: { target }) => {
    setComment(event.target.value);
  };

  const formatDate = (dob: any) => {
    const date = AppUtils.addDateFormat(
      dob,
      AppConstants.DATE_FORMATS.DISPLAY_DATE_FORMAT_HALF_MONTH,
    );
    return date;
  };

  //  Mani --> Changes Done here, remove useMemo dep array
  const panels = () =>
    Object.values(getValues('memberData')).map(
      ({ fullName, dob, adminClosures }: any, index: number) => (
        <Panel
          className=""
          title={`${fullName} (HOH; DOB: ${formatDate(dob)})`}
          key={fullName}
        >
          <TableWrapper
            name="tableWrapper"
            tClassName="members-annual-income-table dashboard-table"
            headings={headings}
            columns={config.columns}
            params={{ lang }}
            Components={Components}
            rows={
              Object.values(adminClosures).filter(
                (closure: { status: string }) =>
                  closure.status === 'APPLIED' || closure.status == 'DRAFT',
              ) || []
            }
            showLoading={isLoading}
            noDataMessage="medicallyFrailInfoHistory.table.noDataFound"
            filterPanelClassName="hix-plan-dialog-filter dialog-filter-docs search-rslts-dialog hix-b-filterbox--dssflow"
            rowIndex={index}
          />
          <Button
            type="button"
            className="btn add-btn hix-m-t-20"
            onClick={() => handleAddReasonClick(fullName)}
          >
            {t('adminClosure.addReason')}
          </Button>
          <Button
            type="button"
            className="btn add-btn hix-m-t-20"
            onClick={() => handleRemoveSelectedReasons(fullName)}
            disabled={!(selectedRows[fullName]?.length > 0)}
          >
            {t('adminClosure.removeReason')}
          </Button>
        </Panel>
      ),
    );

  return (
    <>
      <div className="administrativ-closing hix-c-card-container">
        <div className="hix-c-wellbox hix-c-wellbox-whitebg">
          <p className="hix-e-para"> {t('adminClosure.reason')}</p>
        </div>
        <div className="hix-u-accordian hix-u-accordian--secondary">
          <AccordionGroup aria-label="AccordionGroup-Controlleed">
            {panels}
          </AccordionGroup>
        </div>
        <div className="form-group field field-object hix-m-t-40">
          <span className="font-weight-bold mb-10 clear">
            {''}
            {t(adminClosure.addComment)}
          </span>
          <textarea
            placeholder={t('adminClosure.addComment')}
            aria-label={t('adminClosure.addComment')}
            value={comment}
            onChange={handleCommentChange}
          ></textarea>
          <span className="character-limit">
            {''}
            {t(adminClosure.characterLimit)}
          </span>
        </div>
      </div>
      <div className="">
        <div className="footer-button-cover">
          <Button
            onClick={() => onSubmitHandle('reRun')}
            ref={reRun}
            type="submit"
            name="save"
            action="save"
            className="btn save-button"
          >
            {t('adminClosure.save')}
          </Button>
          <Button
            onClick={() => onSubmitHandle('draft')}
            ref={draft}
            type="draft"
            name="save"
            action="draft"
            className="btn save-button"
          >
            {t('adminClosure.draft')}
          </Button>
        </div>
        <div className="btnSec btnBack mt-1">
          <Back {...{ t, onBack: back }} />
        </div>
      </div>
      <Modalwrapper
        state={showWarningPopUp}
        setTabindex="0"
        ok={showWarningPopUp ? 'adminClosure.ok' : undefined}
        cancel={showWarningPopUp ? 'adminClosure.cancel' : undefined}
        className="show-secondary-button manage-member-dialogue"
        heading={t('adminClosure.warning')}
        onClose={() => setShowWarningPopUp(false)}
        onSave={confirmWarningPopup}
        content={() => <Trans label="adminClosure.warningContent" />}
      />
      <Modalwrapper
        state={showPopUp}
        setTabindex="0"
        ok={showPopUp ? 'adminClosure.ok' : undefined}
        cancel={showPopUp ? 'adminClosure.cancel' : undefined}
        className="show-secondary-button manage-member-dialogue"
        heading={t('adminClosure.addReasonFor')}
        // important change
        onClose={() => {
          setShowPopUp(false);
          reset(backUpFormState.current);
        }}
        onSave={handleAddReasonToTable}
        content={() => (
          <>
            {Object.values(getValues(`memberData.${currentMember}.adminClosures`)).map(
              (closure, index) => (
                <>
                  <Checkbox
                    name={`memberData.${currentMember}.adminClosures.${closure.reason}.isModalCheckBoxSelected`}
                    ref={register}
                    // checked={watch(
                    //   `${currentMember.memberReferenceId}.${closure?.reason.slice(0, 2)}`,
                    // )}
                    onChange={({ target: { checked } }: any) => {
                      const status = checked === true ? 'DRAFT' : '';
                      const key = `memberData.${currentMember}.adminClosures.${closure.reason}.status`;
                      setValue(key, status);
                    }}
                  ></Checkbox>
                  {''}
                  {closure.reason}
                </>
              ),
            )}
          </>
        )}
      />
    </>
  );
};
export default InternalForm;
