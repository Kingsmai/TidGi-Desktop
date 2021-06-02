import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Tab as TabRaw, ListItemText } from '@material-ui/core';
import { TabPanel as TabPanelRaw, TabContext, TabList as TabListRaw } from '@material-ui/lab';
import { SupportedStorageServices } from '@services/types';
import { useTranslation } from 'react-i18next';

import { GitTokenForm } from './GitTokenForm';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
const TabPanel = styled(TabPanelRaw)`
  padding: 5px 0 !important;
  padding-left: 16px !important;
`;
const TabList = styled(TabListRaw)``;
const TabsContainer = styled.div`
  display: flex;
  padding: 15px 0;
  flex-direction: row;
  & ${TabList} {
    min-width: 160px;
  }
`;
const backgroundColorShift = keyframes`
from {background-color: #fdfdfd;}
  to {background-color: #fff;}
`;
const Tab = styled(TabRaw)`
  background-color: #999;
  animation: ${backgroundColorShift} 5s infinite;
  animation-direction: alternate;
  animation-timing-function: cubic-bezier(0.4, 0, 1, 1);
`;

interface Props {
  storageProvider?: SupportedStorageServices;
  storageProviderSetter?: React.Dispatch<React.SetStateAction<SupportedStorageServices>>;
}
/**
 * Create storage provider's token.
 * @returns
 */
export function TokenForm({ storageProvider, storageProviderSetter }: Props): JSX.Element {
  const { t } = useTranslation();
  let [currentTab, currentTabSetter] = useState<SupportedStorageServices>(SupportedStorageServices.github);
  // use external controls if provided
  if (storageProvider !== undefined && typeof storageProviderSetter === 'function') {
    currentTab = storageProvider;
    currentTabSetter = storageProviderSetter;
  }
  // update storageProvider to be an online service, if this Component is opened
  useEffect(() => {
    if (storageProvider === SupportedStorageServices.local && typeof storageProviderSetter === 'function') {
      storageProviderSetter(SupportedStorageServices.github);
    }
  }, [storageProvider, storageProviderSetter]);
  return (
    <Container>
      <ListItemText primary={t('Preference.Token')} secondary={t('Preference.TokenDescription')} />
      <TabContext value={currentTab}>
        <TabsContainer>
          <TabList
            onChange={(_event, newValue) => currentTabSetter(newValue as SupportedStorageServices)}
            orientation="vertical"
            variant="scrollable"
            value={currentTab}
            aria-label="Vertical tabs example">
            <Tab label="GitHub" value={SupportedStorageServices.github} />
            <Tab label="GitLab" value={SupportedStorageServices.gitlab} />
            <Tab label="Gitee" value={SupportedStorageServices.gitee} />
          </TabList>
          <TabPanel value={SupportedStorageServices.github}>
            <GitTokenForm storageService={SupportedStorageServices.github} />
          </TabPanel>
          <TabPanel value={SupportedStorageServices.gitlab}>
            <GitTokenForm storageService={SupportedStorageServices.gitlab} />
          </TabPanel>
          <TabPanel value={SupportedStorageServices.gitee}>
            Gitee（码云）一直不愿意支持 OAuth2 ，所以我们没法适配它的登录系统，如果你认识相关开发人员，请催促他们尽快支持，与国际接轨。
          </TabPanel>
        </TabsContainer>
      </TabContext>
    </Container>
  );
}