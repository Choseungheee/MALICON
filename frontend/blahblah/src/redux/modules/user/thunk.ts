import { createAsyncThunk } from "@reduxjs/toolkit";
import { SigninResponseType } from "../../../model/user/signinResponseType";
import { SigninType } from "../../../model/user/signinType";
import { SignupType } from "../../../model/user/signupType";
import { UserType } from "../../../model/user/userType";
import { UpdateUserType } from "../../../model/user/updateUserType";
import { useAppDispatch } from "../../configStore.hooks";
import {
  getAccessToken,
  removeToken,
  setAccessToken,
  setRefreshToken,
} from "./token";
import { axiosInitializer } from "../../utils/axiosInitializer";

// 회원가입
export const signupAction = createAsyncThunk(
  "SIGNUP",
  async (userData: SignupType, { rejectWithValue }) => {
    try {
      console.log("비동기요청[SIGNUP] 시작");

      const axios = axiosInitializer();

      const { data } = await axios.post(`/api/users`, userData);
      console.log("비동기요청[SIGNUP] 끝 : " + data.message);
      return data;
    } catch (e) {
      console.error(e);
      return rejectWithValue(e);
    }
  }
);

// 아이디 중복 확인
export const checkDuplicateAction = createAsyncThunk(
  "CHECK_DUPLICATE",
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log("비동기요청[CHECK_DUPLICATE] 시작");
      const axios = axiosInitializer();

      const { data } = await axios.get(`/api/users/${userId}`);
      console.log("비동기요청[CHECK_DUPLICATE] 끝 : " + data.message);

      return data;
    } catch (e) {
      console.log("이미 사용중인 아이디!!");
      return rejectWithValue(e);
    }
  }
);

// 로그인
export const signinAction = createAsyncThunk(
  "SIGNIN",
  async (userData: SigninType, { dispatch, rejectWithValue }) => {
    try {
      console.log("비동기요청[SIGNIN] 시작");

      const axios = axiosInitializer();

      await axios
        .post("/api/auth/login", userData, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then(({ data }: any) => {
          console.log("비동기요청[SIGNIN] 끝 : " + data.message);

          // 로컬스토리지 저장
          setAccessToken(data.token.accessToken);
          setRefreshToken(data.token.refreshToken);

          console.log("1111 ", getAccessToken());
        })
        .then(() => {
          // user state에 저장
          dispatch(getMeWithTokenAction());
        });

      // return data;
    } catch (e) {
      console.error(e);
      console.log("로그인 실패");
      return rejectWithValue(e);
    }
  }
);

export const getMeWithTokenAction = createAsyncThunk(
  "GET_ME",
  async (token, { dispatch, rejectWithValue }) => {
    try {
      console.log("비동기요청[GET_ME] 시작");
      console.log("2222 ", getAccessToken());

      const axios = axiosInitializer();
      const { data } = await axios.get("/api/users/me", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Baerer " + getAccessToken(),
        },
      });
      console.log("비동기요청[GET_ME] 끝 : " + data.nickName);
      console.log(`로그인 - User: ${data.userId}`);

      return data;
    } catch (e) {
      // 토큰 갱신
      dispatch(refreshTokenAction());

      return rejectWithValue(e);
    }
  }
);

export const refreshTokenAction = createAsyncThunk(
  "REFRESH_TOKEN",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log("비동기요청[REFRESH_TOKEN] 시작");
      const req = { reqRefreshToken: "" };

      const axios = axiosInitializer();
      const { data } = await axios.post("/api/auth/refresh", req);
      console.log("비동기요청[REFRESH_TOKEN] 끝 : " + data.message);

      setAccessToken(data.token.accessToken);
      setRefreshToken(data.token.refreshToken);

      // user state에 저장
      dispatch(getMeWithTokenAction());

      return data;
    } catch (e) {
      // 로그아웃
      removeToken();
      console.log("로그아웃");

      return rejectWithValue(e);
    }
  }
);

// 회원정보 수정
export const updateUserAction = createAsyncThunk(
  "UPDATE_USER",
  async (userData: any, { rejectWithValue }) => {
    try {
      console.log("비동기요청[UPDATE] 시작");

      const axios = axiosInitializer();

      const { data } = await axios.put(`/api/users`, userData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Baerer " + getAccessToken(),
        },
      });
      console.log("비동기요청[UPDATE] 끝 : " + data.message);
      return data;
    } catch (e) {
      console.error(e);
      return rejectWithValue(e);
    }
  }
);
