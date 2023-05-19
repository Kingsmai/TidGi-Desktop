import { Divider, List } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { usePromiseValue } from '@/helpers/useServiceValue';
import { ListItem, ListItemText, Paper, SectionTitle } from '../PreferenceComponents';
import type { ISectionProps } from '../useSections';

export function DeveloperTools(props: ISectionProps): JSX.Element {
  const { t } = useTranslation();

  const [LOG_FOLDER, SETTINGS_FOLDER] = usePromiseValue(
    async () =>
      await Promise.all([window.service.context.get('LOG_FOLDER'), window.service.context.get('SETTINGS_FOLDER')]).catch((error) => {
        console.error(error);
        return [undefined, undefined];
      }),
    [undefined, undefined],
  ) as [string | undefined, string | undefined];

  return (
    <>
      <SectionTitle ref={props.sections.developers.ref}>{t('Preference.DeveloperTools')}</SectionTitle>
      <Paper elevation={0}>
        <List dense disablePadding>
          {LOG_FOLDER === undefined || SETTINGS_FOLDER === undefined ? <ListItem>{t('Loading')}</ListItem> : (
            <>
              <ListItem
                button
                onClick={() => {
                  if (LOG_FOLDER !== undefined) {
                    void window.service.native.open(LOG_FOLDER, true);
                  }
                }}
              >
                <ListItemText primary={t('Preference.OpenLogFolder')} secondary={t('Preference.OpenLogFolderDetail')} />
                <ChevronRightIcon color='action' />
              </ListItem>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  if (SETTINGS_FOLDER !== undefined) {
                    void window.service.native.open(SETTINGS_FOLDER, true);
                  }
                }}
              >
                <ListItemText primary={t('Preference.OpenMetaDataFolder')} secondary={t('Preference.OpenMetaDataFolderDetail')} />
                <ChevronRightIcon color='action' />
              </ListItem>
              <Divider />
              <ListItem
                button
                onClick={async () => {
                  await window.service.preference.resetWithConfirm();
                }}
              >
                <ListItemText primary={t('Preference.RestorePreferences')} />
                <ChevronRightIcon color='action' />
              </ListItem>
            </>
          )}
        </List>
      </Paper>
    </>
  );
}
