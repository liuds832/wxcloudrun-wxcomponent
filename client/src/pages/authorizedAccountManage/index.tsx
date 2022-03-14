import {Table, Input, PopConfirm, Dialog} from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react'
import {useEffect, useState} from "react";
import {request} from "../../utils/axios";
import {getAuthAccessTokenRequest, getAuthorizedAccountRequest} from "../../utils/apis";
import {PrimaryTableCol} from "tdesign-react/es/table/type";
import moment from "moment";
import {copyMessage} from "../../utils/common";

const officialAccountAuthType: Record<string, string> = {
    "-1": "未认证",
    "0": "微信认证",
    "1": "新浪微博认证",
    "2": "腾讯微博认证",
    "3": "已资质认证通过但还未通过名称认证",
    "4": "已资质认证通过、还未通过名称认证，但通过了新浪微博认证",
    "5": "已资质认证通过、还未通过名称认证，但通过了腾讯微博认证"
}

const miniProgramAuthType: Record<string, string> = {
    "-1": "未认证",
    "0": "微信认证",
}

const tokenColumn: PrimaryTableCol[] = [
    {
        align: 'center',
        minWidth: 100,
        className: 'row',
        colKey: 'token',
        title: 'Token',
    },
    {
        align: 'center',
        minWidth: 100,
        className: 'row',
        colKey: 'id',
        title: '操作',
        render({ row }) {
            return (
                <a className="a" onClick={() => copyMessage(row.token)}>复制</a>
            );
        },
    },
]

export default function AuthorizedAccountManage() {

    const accountColumn: PrimaryTableCol[] = [
        {
            align: 'center',
            minWidth: 100,
            colKey: 'appid',
            title: 'AppID',
        },
        {
            align: 'center',
            minWidth: 100,
            colKey: 'userName',
            title: '原始ID',
        },
        {
            align: 'center',
            minWidth: 120,
            colKey: 'nickName',
            title: '名称',
        },
        {
            align: 'center',
            minWidth: 100,
            colKey: 'appType',
            title: '帐号类型',
            cell: ({ row }) => {
                return row.appType === 0 ? '小程序' : '公众号'
            }
        },
        {
            align: 'center',
            minWidth: 100,
            colKey: 'authTime',
            title: '授权时间',
            render: ({ row }) => moment(row.authTime).format('YYYY-MM-DD HH:mm:ss')
        },
        {
            align: 'center',
            minWidth: 100,
            colKey: 'principalName',
            title: '主体信息',
        },
        {
            align: 'center',
            minWidth: 100,
            className: 'row',
            colKey: 'verifyInfo',
            title: '认证类型',
            cell: ({ row }) => {
                return row.appType === 0 ? miniProgramAuthType[String(row.verifyInfo)] : officialAccountAuthType[String(row.verifyInfo)]
            }
        },
        {
            align: 'center',
            minWidth: 100,
            className: 'row',
            colKey: 'funcInfo',
            title: '授权权限集ID',
        },
        {
            align: 'center',
            fixed: 'right',
            width: 210,
            minWidth: 210,
            className: 'row',
            colKey: 'id',
            title: '操作',
            render({ row }) {
                return (
                    <div style={{ width: '210px' }}>
                        <PopConfirm content="从数据库获取 token，非重新生成token，不会导致上一个 token 被刷新而失效" onConfirm={() => createToken(row.appid)}>
                            <a className="a" style={{ margin: '0 10px' }}>获取token</a>
                        </PopConfirm>
                        <a className="a" onClick={() => copyMessage(row.refreshToken)}>复制refresh_token</a>
                    </div>
                );
            },
        },
    ]

    const pageSize = 15

    const [accountList, setAccountList] = useState([])
    const [accountTotal, setAccountTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [appIdInput, setAppIdInput] = useState<string | number>('')
    const [visibleTokenModal, setVisibleTokenModal] = useState(false)
    const [tokenData, setTokenData] = useState([{
        token: ''
    }])

    useEffect(() => {
        getAccountList()
    }, [currentPage])

    const createToken = async (appId: string) => {
        const resp = await request({
            request: getAuthAccessTokenRequest,
            data: {
                appid: appId
            }
        })
        if (resp.code === 0) {
            setTokenData([{
                token: resp.data.token
            }])
            setVisibleTokenModal(true)
        }
    }

    const getAccountList = async () => {
        const resp = await request({
            request: getAuthorizedAccountRequest,
            data: {
                offset: (currentPage - 1) * pageSize,
                limit: pageSize,
                appid: appIdInput
            }
        })
        if (resp.code === 0) {
            setAccountList(resp.data.records)
            setAccountTotal(resp.data.total)
        }
    }

    return (
        <div>
            <Input value={appIdInput} onChange={setAppIdInput} style={{ width: '400px', marginBottom: '10px' }} placeholder="请输入 AppID，不支持模糊搜索" suffixIcon={<a className="a" onClick={getAccountList}><SearchIcon /></a>} />
            <Table
                data={accountList}
                columns={accountColumn}
                rowKey="id"
                tableLayout="auto"
                verticalAlign="middle"
                size="small"
                hover
                // 与pagination对齐
                pagination={{
                    pageSize,
                    total: accountTotal,
                    current: currentPage,
                    showJumper: true,
                    pageSizeOptions: [15],
                    onCurrentChange: setCurrentPage,
                }}
            />
            <Dialog header="AuthorizerAccessToken" visible={visibleTokenModal} onClose={() => setVisibleTokenModal(false)}>
                <Table
                    data={tokenData}
                    columns={tokenColumn}
                    rowKey="id"
                    tableLayout="auto"
                    verticalAlign="middle"
                    size="small"
                />
            </Dialog>
        </div>
    )
}
