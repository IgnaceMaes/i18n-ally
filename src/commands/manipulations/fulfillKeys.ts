import { window } from 'vscode'
import { ProgressSubmenuView } from '../../views/ProgressView'
import i18n from '../../i18n'
import { LocaleTreeView } from '../../views/LocalesTreeView'
import { Global } from '../../core/Global';
import { CommandOptions } from './common'
import { CurrentFile } from '../../core/CurrentFile';
import { PendingWrite } from '../../core/types';


const FULFILL_VALUE = ''

export async function FulfillMissingKeysForProgress (item: ProgressSubmenuView) {
  const Yes = i18n.t('prompt.button_yes')
  const locale = item.node.locale
  const keys = item.getKeys()

  const result = await window.showWarningMessage(
    i18n.t('prompt.fullfill_missing_confirm', keys.length, locale),
    { modal: true },
    Yes,
  )
  if (result !== Yes)
    return

  const pendings = keys.map(key => ({
    locale,
    value:FULFILL_VALUE,
    filepath: Global.loader.getFilepathByKey(key, locale),
    keypath: key,
  }))

  await Global.loader.writeToFile(pendings) // TODO:sfc
}

export async function FulfillAllMissingKeys () {
  const Yes = i18n.t('prompt.button_yes')
  const result = await window.showWarningMessage(
    i18n.t('prompt.fullfill_missing_all_confirm'),
    { modal: true },
    Yes,
  )
  if (result !== Yes)
    return

  let pendings: PendingWrite[] = []
  for (const locale of Global.visibleLocales){
    const cov = CurrentFile.loader.getCoverage(locale)
    if (!cov)
      continue

    pendings = pendings.concat(cov.missingKeys.map(key => ({
      locale,
      value: FULFILL_VALUE,
      filepath: Global.loader.getFilepathByKey(key, locale),
      keypath: key,
    })))
  }
  await Global.loader.writeToFile(pendings) // TODO:sfc
}

export async function FulfillKeys (item?: LocaleTreeView | ProgressSubmenuView | CommandOptions) {
  if (!item)
    return FulfillAllMissingKeys()

  if (item instanceof ProgressSubmenuView)
    return FulfillMissingKeysForProgress(item)
}