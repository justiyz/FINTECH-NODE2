/* eslint-disable no-irregular-whitespace */
/* eslint-disable max-len */
import dayjs from 'dayjs';
import { decrypt } from '../../utils/lib.util.hash';


export const ticketPDFTemplate = async(ticket_qr_code, purchase_date, ticket_category, user, ticket_record) => {
  return `<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Ticket Details</title>
        <style>
            .body {
                padding: 50px;
                display: flex;
                flex-direction: column;
                gap: 50px;
                font-family: "Roboto", sans-serif;
            }
            .event_details {
                display: flex;
                gap: 40px;
            }
            .event_info {
                display: flex;
                flex-direction: column;
                gap: 30px;
                margin-top: 10px;
            }
            .row {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            .col {
                display: flex;
                flex-direction: row;
                gap: 5px;
            }
            .bold {
                font-weight: bold;
            }
            .divider {
                display: flex;
                flex-direction: column;
                gap: 5px;
                width: 100px;
            }
            .green {
                color: green;
            }
            .margin_top {
                margin-top: -10px;
            }
            .ticket_info {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            .ticket_details {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 20px;
            }
            .barcode {
                margin-left: -15px;
            }
        </style>
    </head>
    <body>
        <div id="ticket" class="body">
            <header>
                <img
                    src="data:image/svg+xml;base64,PHN2Zw0KICAgICAgICAgIHdpZHRoPSIzOCINCiAgICAgICAgICBoZWlnaHQ9IjI2Ig0KICAgICAgICAgIHZpZXdCb3g9IjAgMCAzOCAyNiINCiAgICAgICAgICBmaWxsPSJub25lIg0KICAgICAgICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiAgICAgICAgPg0KICAgICAgICAgIDxwYXRoDQogICAgICAgICAgICBmaWxsLXJ1bGU9ImV2ZW5vZGQiDQogICAgICAgICAgICBjbGlwLXJ1bGU9ImV2ZW5vZGQiDQogICAgICAgICAgICBkPSJNMjUuMDA5OCAyNS40ODM0QzI1LjAxMDEgMjUuNDgzNCAyNS4wMTA1IDI1LjQ4MzQgMjUuMDEwOSAyNS40ODM0QzMxLjkxNjEgMjUuNDgzNCAzNy41MTM4IDE5Ljg4NTcgMzcuNTEzOCAxMi45ODA1QzM3LjUxMzggNi4wNzUyOSAzMS45MTYxIDAuNDc3NTM5IDI1LjAxMDkgMC40Nzc1MzlDMjUuMDEwNSAwLjQ3NzUzOSAyNS4wMTAxIDAuNDc3NTM5IDI1LjAwOTggMC40Nzc1MzlWMjUuNDgzNFoiDQogICAgICAgICAgICBmaWxsPSIjMkE4ODUxIg0KICAgICAgICAgIC8+DQogICAgICAgICAgPHBhdGgNCiAgICAgICAgICAgIGQ9Ik0xMi41MjUzIDAuNDU4MDA4QzUuNjA3NzYgMC40NTgwMDggMS4yMjU2MmUtMDcgNi4wNjU3NyAyLjczNzUxZS0wNyAxMi45ODMzTDUuNDc1NzVlLTA3IDI1LjUxMTlMMTIuNTI4NyAyNS41MTE5QzE5LjQ0NjIgMjUuNTExOSAyNS4wNTM5IDE5LjkwNDIgMjUuMDUzOSAxMi45ODY3QzI1LjA1MzkgNi4wNjcyNyAxOS40NDQ3IDAuNDU4MDA3IDEyLjUyNTMgMC40NTgwMDhaIg0KICAgICAgICAgICAgZmlsbD0iIzJBODg1MSINCiAgICAgICAgICAvPg0KICAgICAgICA8L3N2Zz4="
                    alt=""
                />
                <img
                    src="data:image/svg+xml;base64,ICA8c3ZnDQogICAgICAgICAgd2lkdGg9IjEwMSINCiAgICAgICAgICBoZWlnaHQ9IjI2Ig0KICAgICAgICAgIHZpZXdCb3g9IjAgMCAxMDEgMjYiDQogICAgICAgICAgZmlsbD0ibm9uZSINCiAgICAgICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciDQogICAgICAgID4NCiAgICAgICAgICA8cGF0aA0KICAgICAgICAgICAgZD0iTTkuNTM3ODggMjUuNTA3MUM4LjI3MjE0IDI1LjUwNzEgNy4xMDk5NiAyNS4zNTczIDYuMDUxMzQgMjUuMDU3OEM1LjAxNTc0IDI0Ljc1ODMgNC4wOTUyIDI0LjM0MzUgMy4yODk3MyAyMy44MTM2QzIuNTA3MjcgMjMuMjgzNiAxLjg1MTM5IDIyLjY5NiAxLjMyMjA4IDIyLjA1MDlDMC44MTU3ODMgMjEuMzgyNyAwLjQ1OTA3NCAyMC42OTE0IDAuMjUxOTUzIDE5Ljk3NzFMNC4xODcyNSAxOC43Njc0QzQuNDg2NDMgMTkuNjIgNS4wNzMyNyAyMC4zNjg4IDUuOTQ3NzggMjEuMDE0QzYuODIyMyAyMS42NTkyIDcuOTAzOTMgMjEuOTkzMyA5LjE5MjY4IDIyLjAxNjNDMTAuNjg4NiAyMi4wMTYzIDExLjg3MzcgMjEuNzA1MiAxMi43NDgzIDIxLjA4MzFDMTMuNjIyOCAyMC40NjEgMTQuMDYgMTkuNjQzIDE0LjA2IDE4LjYyOTJDMTQuMDYgMTcuNzA3NSAxMy42OTE4IDE2Ljk1ODcgMTIuOTU1NCAxNi4zODI2QzEyLjIxOSAxNS43ODM1IDExLjIyOTQgMTUuMzIyNyA5Ljk4NjY1IDE1LjAwMDFMNy4wMTc5MSAxNC4yMzk3QzUuODkwMjUgMTMuOTQwMiA0Ljg2NjE1IDEzLjUwMjQgMy45NDU2MSAxMi45MjY0QzMuMDQ4MDkgMTIuMzUwMyAyLjMzNDY3IDExLjYyNDUgMS44MDUzNiAxMC43NDg5QzEuMjk5MDcgOS44NzMzNSAxLjA0NTkyIDguODM2NDggMS4wNDU5MiA3LjYzODMxQzEuMDQ1OTIgNS4zODAyMyAxLjc4MjM1IDMuNjI5MDYgMy4yNTUyMSAyLjM4NDgxQzQuNzI4MDcgMS4xMTc1MiA2LjgzMzggMC40ODM4NzUgOS41NzI0IDAuNDgzODc1QzExLjExNDMgMC40ODM4NzUgMTIuNDYwNiAwLjcyNTgxMiAxMy42MTEzIDEuMjA5NjlDMTQuNzg1IDEuNjcwNTIgMTUuNzUxNSAyLjMxNTY5IDE2LjUxMSAzLjE0NTE4QzE3LjI3MDQgMy45NTE2NCAxNy44MzQyIDQuODczMzEgMTguMjAyNCA1LjkxMDE5TDE0LjMzNjIgNy4xNTQ0M0MxMy45OTEgNi4yMzI3NyAxMy4zOTI2IDUuNDcyMzkgMTIuNTQxMSA0Ljg3MzMxQzExLjY4OTYgNC4yNzQyMyAxMC42MzEgMy45NzQ2OSA5LjM2NTI4IDMuOTc0NjlDOC4wNTM1MiAzLjk3NDY5IDcuMDE3OTEgNC4yODU3NSA2LjI1ODQ3IDQuOTA3ODdDNS41MjIwNCA1LjUzIDUuMTUzODIgNi4zOTQwNiA1LjE1MzgyIDcuNTAwMDZDNS4xNTM4MiA4LjM5ODY4IDUuNDQxNDkgOS4xMDE0NSA2LjAxNjgyIDkuNjA4MzdDNi42MTUxNyAxMC4wOTIyIDcuNDIwNjUgMTAuNDYwOSA4LjQzMzI0IDEwLjcxNDRMMTEuNDAyIDExLjQ0MDJDMTMuNTY1MiAxMS45NzAxIDE1LjI0NTIgMTIuODgwMyAxNi40NDE5IDE0LjE3MDZDMTcuNjM4NiAxNS40NjEgMTguMjM3IDE2Ljg4OTUgMTguMjM3IDE4LjQ1NjRDMTguMjM3IDE5LjgzODkgMTcuOTAzMyAyMS4wNjAxIDE3LjIzNTkgMjIuMTJDMTYuNTY4NSAyMy4xNzk5IDE1LjU3ODkgMjQuMDA5NCAxNC4yNjcxIDI0LjYwODVDMTIuOTc4NCAyNS4yMDc2IDExLjQwMiAyNS41MDcxIDkuNTM3ODggMjUuNTA3MVoiDQogICAgICAgICAgICBmaWxsPSIjMkE4ODUxIg0KICAgICAgICAgIC8+DQogICAgICAgICAgPHBhdGgNCiAgICAgICAgICAgIGQ9Ik0yOC42MDUyIDI1LjUwNzFDMjYuOTI1MiAyNS41MDcxIDI1LjQyOTMgMjUuMTI2OSAyNC4xMTc1IDI0LjM2NjZDMjIuODI4OCAyMy41ODMxIDIxLjgwNDcgMjIuNTExNyAyMS4wNDUyIDIxLjE1MjJDMjAuMzA4OCAxOS43OTI4IDE5Ljk0MDYgMTguMjI2IDE5Ljk0MDYgMTYuNDUxN0MxOS45NDA2IDE0LjY3NzUgMjAuMzIwMyAxMy4xMTA3IDIxLjA3OTggMTEuNzUxMkMyMS44MzkyIDEwLjM5MTggMjIuODc0OCA5LjMzMTg3IDI0LjE4NjYgOC41NzE1QzI1LjUyMTQgNy43ODgwOCAyNy4wNDAyIDcuMzk2MzcgMjguNzQzMiA3LjM5NjM3QzMwLjI4NTEgNy4zOTYzNyAzMS42NjYgNy43OTk2IDMyLjg4NTcgOC42MDYwNkMzNC4xMjg0IDkuMzg5NDggMzUuMTE4IDEwLjUzIDM1Ljg1NDQgMTIuMDI3N0MzNi41OTA4IDEzLjUyNTUgMzYuOTU5IDE1LjMxMTIgMzYuOTU5IDE3LjM4NDlIMzMuMDU4M0MzMy4wNTgzIDE1Ljg4NzIgMzIuODc0MiAxNC42NTQ1IDMyLjUwNTkgMTMuNjg2N0MzMi4xNjA3IDEyLjcxOSAzMS42NTQ0IDEyLjAwNDcgMzAuOTg3MSAxMS41NDM5QzMwLjM0MjcgMTEuMDYgMjkuNTQ4NyAxMC44MTgxIDI4LjYwNTIgMTAuODE4MUMyNy42MTU2IDEwLjgxODEgMjYuNzY0MSAxMS4wMzcgMjYuMDUwNyAxMS40NzQ3QzI1LjMzNzMgMTEuOTEyNSAyNC43OTY0IDEyLjU1NzcgMjQuNDI4MiAxMy40MTAyQzI0LjA2IDE0LjIzOTcgMjMuODc1OSAxNS4yODgxIDIzLjg3NTkgMTYuNTU1NEMyMy44NzU5IDE3LjY4NDUgMjQuMDk0NSAxOC42NTIyIDI0LjUzMTggMTkuNDU4N0MyNC45OTIxIDIwLjI2NTEgMjUuNjAxOSAyMC44ODczIDI2LjM2MTQgMjEuMzI1MUMyNy4xNDM4IDIxLjczOTggMjguMDA2OCAyMS45NDcyIDI4Ljk1MDQgMjEuOTQ3MkMyOS45ODYgMjEuOTQ3MiAzMC44Mzc1IDIxLjcxNjggMzEuNTA0OSAyMS4yNTU5QzMyLjE3MjMgMjAuNzcyMSAzMi42OTAxIDIwLjE2MTUgMzMuMDU4MyAxOS40MjQxTDM2LjYxMzggMjAuOTQ0OUMzNi4xMzA2IDIxLjg2NjUgMzUuNTA5MiAyMi42NzMgMzQuNzQ5OCAyMy4zNjQyQzM0LjAxMzMgMjQuMDU1NSAzMy4xMjczIDI0LjU4NTQgMzIuMDkxNyAyNC45NTQxQzMxLjA3OTEgMjUuMzIyOCAyOS45MTY5IDI1LjUwNzEgMjguNjA1MiAyNS41MDcxWk0yMi40OTUxIDE3LjM4NDlWMTQuMzA4OUgzNC45MjI0VjE3LjM4NDlIMjIuNDk1MVoiDQogICAgICAgICAgICBmaWxsPSIjMkE4ODUxIg0KICAgICAgICAgIC8+DQogICAgICAgICAgPHBhdGgNCiAgICAgICAgICAgIGQ9Ik00Ni41ODI2IDI1LjUwNzFDNDQuOTAyNiAyNS41MDcxIDQzLjQwNjggMjUuMTI2OSA0Mi4wOTUgMjQuMzY2NkM0MC44MDYzIDIzLjU4MzEgMzkuNzgyMiAyMi41MTE3IDM5LjAyMjcgMjEuMTUyMkMzOC4yODYzIDE5Ljc5MjggMzcuOTE4MSAxOC4yMjYgMzcuOTE4MSAxNi40NTE3QzM3LjkxODEgMTQuNjc3NSAzOC4yOTc4IDEzLjExMDcgMzkuMDU3MiAxMS43NTEyQzM5LjgxNjcgMTAuMzkxOCA0MC44NTIzIDkuMzMxODcgNDIuMTY0IDguNTcxNUM0My40OTg4IDcuNzg4MDggNDUuMDE3NyA3LjM5NjM3IDQ2LjcyMDcgNy4zOTYzN0M0OC4yNjI2IDcuMzk2MzcgNDkuNjQzNCA3Ljc5OTYgNTAuODYzMSA4LjYwNjA2QzUyLjEwNTkgOS4zODk0OCA1My4wOTU0IDEwLjUzIDUzLjgzMTkgMTIuMDI3N0M1NC41NjgzIDEzLjUyNTUgNTQuOTM2NSAxNS4zMTEyIDU0LjkzNjUgMTcuMzg0OUg1MS4wMzU3QzUxLjAzNTcgMTUuODg3MiA1MC44NTE2IDE0LjY1NDUgNTAuNDgzNCAxMy42ODY3QzUwLjEzODIgMTIuNzE5IDQ5LjYzMTkgMTIuMDA0NyA0OC45NjQ1IDExLjU0MzlDNDguMzIwMSAxMS4wNiA0Ny41MjYyIDEwLjgxODEgNDYuNTgyNiAxMC44MTgxQzQ1LjU5MyAxMC44MTgxIDQ0Ljc0MTYgMTEuMDM3IDQ0LjAyODEgMTEuNDc0N0M0My4zMTQ3IDExLjkxMjUgNDIuNzczOSAxMi41NTc3IDQyLjQwNTcgMTMuNDEwMkM0Mi4wMzc1IDE0LjIzOTcgNDEuODUzNCAxNS4yODgxIDQxLjg1MzQgMTYuNTU1NEM0MS44NTM0IDE3LjY4NDUgNDIuMDcyIDE4LjY1MjIgNDIuNTA5MiAxOS40NTg3QzQyLjk2OTUgMjAuMjY1MSA0My41Nzk0IDIwLjg4NzMgNDQuMzM4OCAyMS4zMjUxQzQ1LjEyMTMgMjEuNzM5OCA0NS45ODQzIDIxLjk0NzIgNDYuOTI3OCAyMS45NDcyQzQ3Ljk2MzQgMjEuOTQ3MiA0OC44MTQ5IDIxLjcxNjggNDkuNDgyMyAyMS4yNTU5QzUwLjE0OTcgMjAuNzcyMSA1MC42Njc1IDIwLjE2MTUgNTEuMDM1NyAxOS40MjQxTDU0LjU5MTMgMjAuOTQ0OUM1NC4xMDggMjEuODY2NSA1My40ODY3IDIyLjY3MyA1Mi43MjcyIDIzLjM2NDJDNTEuOTkwOCAyNC4wNTU1IDUxLjEwNDggMjQuNTg1NCA1MC4wNjkyIDI0Ljk1NDFDNDkuMDU2NiAyNS4zMjI4IDQ3Ljg5NDQgMjUuNTA3MSA0Ni41ODI2IDI1LjUwNzFaTTQwLjQ3MjYgMTcuMzg0OVYxNC4zMDg5SDUyLjg5OThWMTcuMzg0OUg0MC40NzI2WiINCiAgICAgICAgICAgIGZpbGw9IiMyQTg4NTEiDQogICAgICAgICAgLz4NCiAgICAgICAgICA8cGF0aA0KICAgICAgICAgICAgZD0iTTY5LjMyMzkgMjUuMDkyNEw2OS4xNTEzIDIxLjg3ODFWMC44OTg2MjNINzIuOTgzVjI1LjA5MjRINjkuMzIzOVpNNjMuNjk3MSAyNS41MDcxQzYyLjEzMjIgMjUuNTA3MSA2MC43NjI5IDI1LjEzODQgNTkuNTg5MiAyNC40MDExQzU4LjQzODUgMjMuNjQwNyA1Ny41Mjk1IDIyLjU4MDggNTYuODYyMSAyMS4yMjE0QzU2LjIxNzcgMTkuODYxOSA1NS44OTU1IDE4LjI3MiA1NS44OTU1IDE2LjQ1MTdDNTUuODk1NSAxNC42MDg0IDU2LjIxNzcgMTMuMDE4NSA1Ni44NjIxIDExLjY4MjFDNTcuNTI5NSAxMC4zMjI3IDU4LjQzODUgOS4yNzQyNyA1OS41ODkyIDguNTM2OTNDNjAuNzYyOSA3Ljc3NjU2IDYyLjEzMjIgNy4zOTYzNyA2My42OTcxIDcuMzk2MzdDNjUuMTQ2OSA3LjM5NjM3IDY2LjM4OTcgNy43NzY1NiA2Ny40MjUzIDguNTM2OTNDNjguNDgzOSA5LjI3NDI3IDY5LjI4OTQgMTAuMzIyNyA2OS44NDE3IDExLjY4MjFDNzAuMzk0IDEzLjAxODUgNzAuNjcwMiAxNC42MDg0IDcwLjY3MDIgMTYuNDUxN0M3MC42NzAyIDE4LjI3MiA3MC4zOTQgMTkuODYxOSA2OS44NDE3IDIxLjIyMTRDNjkuMjg5NCAyMi41ODA4IDY4LjQ4MzkgMjMuNjQwNyA2Ny40MjUzIDI0LjQwMTFDNjYuMzg5NyAyNS4xMzg0IDY1LjE0NjkgMjUuNTA3MSA2My42OTcxIDI1LjUwNzFaTTY0LjY2MzcgMjEuOTgxN0M2NS41MzgyIDIxLjk4MTcgNjYuMzA5MSAyMS43NTEzIDY2Ljk3NjUgMjEuMjkwNUM2Ny42NjY5IDIwLjgwNjYgNjguMTk2MiAyMC4xNDk5IDY4LjU2NDQgMTkuMzIwNEM2OC45NTU3IDE4LjQ5MDkgNjkuMTUxMyAxNy41MzQ3IDY5LjE1MTMgMTYuNDUxN0M2OS4xNTEzIDE1LjM2ODggNjguOTU1NyAxNC40MTI2IDY4LjU2NDQgMTMuNTgzMUM2OC4xOTYyIDEyLjc1MzYgNjcuNjY2OSAxMi4xMDg0IDY2Ljk3NjUgMTEuNjQ3NkM2Ni4zMDkxIDExLjE4NjcgNjUuNTI2NyAxMC45NTYzIDY0LjYyOTEgMTAuOTU2M0M2My43MDg2IDEwLjk1NjMgNjIuODkxNiAxMS4xODY3IDYyLjE3ODIgMTEuNjQ3NkM2MS40NjQ4IDEyLjEwODQgNjAuOTAxIDEyLjc1MzYgNjAuNDg2NyAxMy41ODMxQzYwLjA5NTUgMTQuNDEyNiA1OS44ODg0IDE1LjM2ODggNTkuODY1MyAxNi40NTE3QzU5Ljg4ODQgMTcuNTM0NyA2MC4wOTU1IDE4LjQ5MDkgNjAuNDg2NyAxOS4zMjA0QzYwLjkwMSAyMC4xNDk5IDYxLjQ2NDggMjAuODA2NiA2Mi4xNzgyIDIxLjI5MDVDNjIuOTE0NiAyMS43NTEzIDYzLjc0MzEgMjEuOTgxNyA2NC42NjM3IDIxLjk4MTdaIg0KICAgICAgICAgICAgZmlsbD0iIzJBODg1MSINCiAgICAgICAgICAvPg0KICAgICAgICAgIDxwYXRoDQogICAgICAgICAgICBkPSJNNzUuNDk2OCAyNS4wOTI0TDc5LjUzNTcgMC44OTg2MjNIODMuNTRMNzkuNTAxMSAyNS4wOTI0SDc1LjQ5NjhaTTgwLjUwMjIgMTUuMDAwMUw4MS4xMjM2IDExLjMzNjVIOTEuMjAzNUw5MC41ODIxIDE1LjAwMDFIODAuNTAyMlpNODIuMjYyNyA0LjU2MjI1TDgyLjg0OTYgMC44OTg2MjNIOTQuNTUxOUw5My45NjUxIDQuNTYyMjVIODIuMjYyN1oiDQogICAgICAgICAgICBmaWxsPSIjMkE4ODUxIg0KICAgICAgICAgIC8+DQogICAgICAgICAgPHBhdGgNCiAgICAgICAgICAgIGQ9Ik05Mi45NTczIDI1LjA5MjRMOTUuODkxNSA3LjgxMTEySDk5LjcyMzJMOTYuNzg5IDI1LjA5MjRIOTIuOTU3M1pNOTguNzIyMSA0LjUyNzY4Qzk4LjEyMzggNC41Mjc2OCA5Ny41OTQ1IDQuMzA4NzkgOTcuMTM0MiAzLjg3MUM5Ni42NzM5IDMuNDEwMTcgOTYuNDQzOCAyLjg2ODY5IDk2LjQ0MzggMi4yNDY1NkM5Ni40NDM4IDEuNjI0NDQgOTYuNjczOSAxLjA5NDQ4IDk3LjEzNDIgMC42NTY2ODdDOTcuNTk0NSAwLjIxODg5NSA5OC4xMjM4IDAgOTguNzIyMSAwQzk5LjM0MzUgMCA5OS44NzI4IDAuMjE4ODk1IDEwMC4zMSAwLjY1NjY4N0MxMDAuNzcgMS4wOTQ0OCAxMDEgMS42MjQ0NCAxMDEgMi4yNDY1NkMxMDEgMi44Njg2OSAxMDAuNzcgMy40MTAxNyAxMDAuMzEgMy44NzFDOTkuODcyOCA0LjMwODc5IDk5LjM0MzUgNC41Mjc2OCA5OC43MjIxIDQuNTI3NjhaIg0KICAgICAgICAgICAgZmlsbD0iIzJBODg1MSINCiAgICAgICAgICAvPg0KICAgICAgICA8L3N2Zz4="
                    alt=""
                />
            </header>
            <div class="event_details">
                <img height="209" width="173" src="${ticket_record.ticket_image_url}" alt="" />
                <div class="event_info">
                    <div class="row"><span>Event Title:</span> <span class="bold">${ticket_record.ticket_name}</span></div>
                    <div class="row"><span>Owner’s Details:</span> <span class="bold">${user.first_name} ${user.last_name}</span></div>
                    <div class="row"><span>Purchased on:</span> <span class="bold">${purchase_date}</span></div>
                </div>
            </div>
            <div class="divider">
                <img
                    width="700"
                    src="data:image/svg+xml;base64,IDxzdmcNCiAgICAgICAgICB3aWR0aD0iNjAwIg0KICAgICAgICAgIGhlaWdodD0iMSINCiAgICAgICAgICB2aWV3Qm94PSIwIDAgNjAwIDEiDQogICAgICAgICAgZmlsbD0ibm9uZSINCiAgICAgICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciDQogICAgICAgID4NCiAgICAgICAgICA8bGluZQ0KICAgICAgICAgICAgeTE9IjAuNSINCiAgICAgICAgICAgIHgyPSI1MTUiDQogICAgICAgICAgICB5Mj0iMC41Ig0KICAgICAgICAgICAgc3Ryb2tlPSIjMkE4ODUxIg0KICAgICAgICAgICAgc3Ryb2tlLWRhc2hhcnJheT0iMyAzIg0KICAgICAgICAgIC8+DQogICAgICAgIDwvc3ZnPg=="
                    alt=""
                />
                <img
                    width="700"
                    src="data:image/svg+xml;base64,IDxzdmcNCiAgICAgICAgICB3aWR0aD0iNjAwIg0KICAgICAgICAgIGhlaWdodD0iMSINCiAgICAgICAgICB2aWV3Qm94PSIwIDAgNjAwIDEiDQogICAgICAgICAgZmlsbD0ibm9uZSINCiAgICAgICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciDQogICAgICAgID4NCiAgICAgICAgICA8bGluZQ0KICAgICAgICAgICAgeTE9IjAuNSINCiAgICAgICAgICAgIHgyPSI1MTUiDQogICAgICAgICAgICB5Mj0iMC41Ig0KICAgICAgICAgICAgc3Ryb2tlPSIjMkE4ODUxIg0KICAgICAgICAgICAgc3Ryb2tlLWRhc2hhcnJheT0iMyAzIg0KICAgICAgICAgIC8+DQogICAgICAgIDwvc3ZnPg=="
                    alt=""
                />
            </div>
            <div class="ticket_info">
                <span class="bold">Ticket Information</span>
                <div class="event_details">
                    <img class="barcode" height="137" width="137" src="${ticket_qr_code}" alt="" />
                    <div class="ticket_details">
                        <div class="col"><span>Ticket Type:</span> <span class="bold">${ticket_category.ticket_category_type}</span></div>
                        <div class="col"><span>Venue:</span> <span class="bold">${ticket_record.event_location}</span></div>
                        <div class="col"><span>Date:</span> <span class="bold">${ticket_record.event_date}</span></div>
                        <div class="col"><span>Time:</span> <span class="bold">${ticket_record.event_time}</span></div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
`;
};

export const offerLetterTemplate = async(loanDetails, userOfferLetterDetail, genderType, loanType, loanPurposeType, houseAddressStreet, houseAddressState) => {
  return `
    <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <title>OFFER LETTER REVISED</title>
</head>

<body style="padding: 40px; font-family: Montserrat, sans-serif; font-size: 14px;">
  <div style="margin-bottom: 40px;">
    <p>${dayjs().format('MMMM D, YYYY')}</p>
    <p>${houseAddressStreet}</p>
    <p>${houseAddressState}</p>
  </div>

  <div>
    <p style="margin-bottom: 40px;">Dear ${genderType},</p>

    <h4 style="margin-bottom: 40px;">RE: OFFER LETTER – ${loanType.toUpperCase()} LOAN</h4>

    <p>
      Further to your request for the subject facility, we are pleased to inform you that the facility has been approved under the following terms and conditions:
    </p>
  </div>

  <table width="80%" cell-spacing="0" cell-padding="0">
    <tr>
      <td width="30%" height="40px">Facility Type:</td>
      <td>${loanType} Loan.</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Lender:</td>
      <td>SeedFi</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Borrower:</td>
      <td>${userOfferLetterDetail.full_name} (“Borrower”)</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Bank Verification Number:</td>
      <td>${await decrypt(decodeURIComponent(userOfferLetterDetail.bvn))}</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Amount:</td>
      <td>₦${parseFloat(loanDetails.amount_requested).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ( Naira only)</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Tenor:</td>
      <td>${Number(loanDetails.loan_tenor_in_months)} months</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Purpose:</td>
      <td>${loanPurposeType}</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Interest Rate:</td>
      <td>${loanDetails.percentage_pricing_band}% p.a. (floating)</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Annual Percentage Rate:</td>
      <td>${parseFloat(loanDetails.percentage_pricing_band  + loanDetails.percentage_processing_fee + loanDetails.percentage_advisory_fee + loanDetails.percentage_insurance_fee).toFixed(2)}%</td>
    </tr>
    <tr>
      <td width="30%" height="40px" style="vertical-align: top;">Rate Review:</td>
      <td>These rates are subject to review/change in line with money market conditions at any time or SeedFi’s discretion. SeedFi will send a notification via email or Short Message Service (SMS) or written letter in advance of the application of the new rate. However, SeedFi has the right to implement the changes at the end of the notice period if there is no response to the notice.</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Repayment:</td>
      <td>Equal Monthly repayment of ₦${parseFloat(loanDetails.monthly_repayment).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Repayment Source:</td>
      <td>The facility will be repaid from the Borrower’s business proceeds and other cashflow sources available to the Borrower </td>
    </tr>
    <tr>
      <td width="30%" height="40px">Repayment Mode:</td>
      <td>Interest and principal repayments shall be repaid monthly</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Processing Fee:</td>
      <td>${parseFloat(loanDetails.percentage_processing_fee).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}% flat</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Advisory Fee:</td>
      <td>${parseFloat(loanDetails.percentage_advisory_fee).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}% flat</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Insurance Fee:</td>
      <td>${parseFloat(loanDetails.percentage_insurance_fee).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}% per annum payable upfront</td>
    </tr>
  </table>

  <div>
    <h4 style="margin-bottom: 20px;">CONDITIONS PRECEDENT TO DRAWDOWN</h4>

    <ol style="padding-left: 15px;">
      <li>Submission of request for the facility.
      </li>
      <li>Execution of offer letter in acceptance of the facility.</li>
      <li>Acceptance of terms and conditions. </li>
    </ol>

<div>
      <h4 style="margin-bottom: 20px;">TRANSACTION DYNAMICS</h4>

  <ol style="padding-left: 15px;">
    <li>The Borrower executes offer letter, accepts terms and condition, and any other required document</li>
    <li>Loan is booked for approved tenor.</li>
    <li>Borrower’s account is debited monthly for loan repayment</li>
  </ol>

  <ol type="A" style="padding-left: 15px;">
        <li>
          <h4>Other Conditions</h4>
          <ol style="padding-left: 0px;">
            <li>This offer letter shall not be binding unless it is accepted unconditionally within 30 days from the date hereof. Upon acceptance, it shall remain valid for a period of 90 days, after which it is deemed to have elapsed if the facility is not utilized.</li>
            <li>Without prejudice to the foregoing, SeedFi reserves the right to vary, alter or amend any of the terms and conditions of the facility as and when the need arises.</li>
            <li>All expenses incurred in the arrangement, documentation, and enforcement of payments under the facility, including all professional, valuation, legal and monitoring fees, taxes and commissions (if any) would be borne by the Borrower and SeedFi shall be entitled to debit the Borrower’s account immediately for such expenses.</li>
            <li>Utilization of the facility or any part thereof shall be at SeedFi’s discretion and is subject to satisfactory documentation and regulation of the Central Bank of Nigeria (CBN) as may be laid down from time to time.</li>
            <li>The Borrower hereby agrees to indemnify SeedFi against any loss howsoever occurring that they may incur, because of any misrepresentation, irregularity, or incompleteness in the information contained in any document submitted to SeedFi.</li>
            <li>Where there is a turnover covenant, and there is the default in the turnover covenant which exceeds a continuous period of three (3) months and extends up to six (6) months, in addition to the increase in the interest rate pricing mentioned above, the approved limit for the facility shall be reduced to match the level of the turnover achieved.</li>
            <li>Funds received into the account when the principal and/or interest are past due will be applied first to the overdue interest before the outstanding principal amount.</li>
            <li>The facility shall terminate and all sums due to SeedFi hereunder shall become immediately due and payable if the Borrower commits any breach or defaults under the terms of this facility or any other credit facility granted to the Borrower by SeedFi or any other bank.</li>
            <li>SeedFi reserves the right to cancel its commitment unconditionally if the facility remains undrawn or if, in SeedFi’s opinion, there is any deterioration in the Borrower’s creditworthiness and the Borrower shall thereafter be notified of such cancellation.</li>
          </ol>
        </li>

        <li>
          <h4>Covenants</h4>
          <ol style="padding-left: 0px;" type="i">
            <p>The Borrower undertakes that during the validity of the facility while there are any outstanding thereon, it shall: </p>
            <li>
Not, without SeedFi’s prior written consent, make any offer of employment or engage either directly or indirectly any staff of SeedFi that is involved in providing advisory or relationship management services in respect of the facility, during the tenor of the facility or within twelve (12) months of the liquidation/repayment of the facility.</li>
            <li>At any time and from time to time, upon the written request of SeedFi promptly and duly execute and deliver such further instruments and documents and take such further actions as SeedFi reasonably may request to obtain or preserve the full benefits of this facility and the rights and powers herein granted.</li>
          </ol>
        </li>
    <li>
      <ol style="padding-left: 0px;">
        <h4>Voluntary Prepayment</h4>
       <p>The Borrower may repay the whole or any part of the loan upon giving the Lender 7 (seven) business days prior notice. Any amount prepaid may not be redrawn (and shall be applied against scheduled repayments in inverse order of maturity. Any amount prepaid shall include interest and any pro rata amount of fees that become due and payable on the immediately succeeding due date for such fees. This is provided, however, that the Borrower may be charged a fee if the Borrower pays off the loan before maturity. </p>
      </ol>
    </li>

    <li>
      <h4>Assignment</h4>
      <p>The Borrower hereby acknowledges that SeedFi may sell, transfer, assign, novate or otherwise dispose of all or part of its rights or obligations (including by granting of participations) under this Agreement to its lending partner (Sterling Bank) or another bank, financial institution, to a trust, fund, or any other entity which is engaged in or established to make, purchase or investing in loans, securities or other financial assets. The Borrower hereby agrees to execute all documents and take all such steps as may reasonably be required by SeedFi to give effect to such an assignment or transfer.</p>
    </li>

    <li>
      <h4>Cooling Off Period:</h4>
      <p>The Borrower may cancel this loan contract within 3 days after signing without any penalty or charges, however, the Borrower reserves the right to waive this option by notifying SeedFi in writing. </p>
    </li>
      </ol>
</div>

  </div>

  <div>
    <p style="margin-bottom: 40px;">
      Yours Sincerely,  <br />
      For: SeedFi.
    </p>

    <p>
      Pelumi Alli <br />
      CEO
    </p>
  </div>
</body>

</html>`;
};

