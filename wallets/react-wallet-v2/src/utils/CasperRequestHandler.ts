import { CASPER_SIGNING_METHODS } from '@/data/CASPERData'
import { DeployUtil } from 'casper-js-sdk'
import { casperAddresses, casperWallets } from '@/utils/CasperWalletUtil'
import { getWalletAddressFromParams } from '@/utils/HelperUtil'
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils'
import { SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'

export async function approveCasperRequest(
  requestEvent: SignClientTypes.EventArguments['session_request']
) {
  const { params, id } = requestEvent
  const { request } = params
  const wallet = casperWallets[getWalletAddressFromParams(casperAddresses, params)]
  switch (request.method) {
    case CASPER_SIGNING_METHODS.CASPER_SIGN_MESSAGE:
      console.log('params', casperAddresses, params)
      const signedMessage = await wallet.signMessage(request.params.message)
      return formatJsonRpcResult(id, signedMessage)

    case CASPER_SIGNING_METHODS.CASPER_SIGN_DEPLOY:
      const deploy = DeployUtil.deployFromJson(request.params).unwrap()
      const signedDeploy = await wallet.signDeploy(deploy)

      return formatJsonRpcResult(id, DeployUtil.deployToJson(signedDeploy))

    default:
      throw new Error(getSdkError('INVALID_METHOD').message)
  }
}

export function rejectCaspperRequest(request: SignClientTypes.EventArguments['session_request']) {
  const { id } = request

  return formatJsonRpcError(id, getSdkError('USER_REJECTED_METHODS').message)
}
