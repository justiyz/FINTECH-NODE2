import {generateReferralCode} from '../../src/users/lib/utils/lib.util.helpers';

export const zeehVerifyNinTestResponse = (user, nin) => {
  const data = {
    status: 200,
    code: 0,
    data: {
      entity: {
        first_name: user.first_name,
        last_name: user.last_name,
        gender: user.gender,
        middle_name: user.middle_name !== null ? user.middle_name : '',
        phone_number1: user.phone_number,
        photo: 'ygguygujhgjghy8tw67tyuhjikhnkjghuo',
        date_of_birth: user.date_of_birth,
        customer: '38e0e1c0-2318-4292-8180-b35345f6dd99'
      }
    }
  };
  return data;
};

export const dojahVerifyVINTestResponse = (user, vin) => {
  const data = {
    status: 200,
    data: {
      entity: {
        full_name: user.first_name + ' ' + user.last_name,
        voter_identification_number: vin,
        gender: 'Male',
        occupation: 'STUDENT',
        time_of_registration: '2011-02-18 13:59:46',
        state: 'ONDO',
        local_government: 'IDANRE',
        registration_area_ward: 'ISALU JIGBOKIN',
        polling_unit: 'OJAJIGBOKIN, O/S IN FRONT OF ABANA I & II',
        polling_unit_code: '18/07/07/005',
        address: 'NO 16 OWODE QTS KABBA',
        phone: user.phone_number,
        date_of_birth: user.date_of_birth
      }
    }
  };
  return data;
};

export const dojahVerifyBvnTestResponse = (user, bvn) => {
  const data = {
    status: 200,
    data: {
      entity: {
        bvn: bvn,
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: user.middle_name !== null ? user.middle_name : '',
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        phone_number1: user.phone_number,
        image: 'ygguygujhgjghy8tw67tyuhjikhnkjghuo',
        email: '',
        enrollment_bank: '033',
        enrollment_branch: 'Badagry',
        level_of_account: 'Level 1 - Low Level Accounts',
        lga_of_origin: 'Katsina-Ala',
        lga_of_residence: 'Badagry',
        marital_status: 'Married',
        name_on_card: '242 c compound badagry',
        nationality: 'Nigeria',
        nin: '',
        phone_number2: '',
        registration_date: '',
        residential_address: '242 c compound badaGRY ',
        state_of_origin: 'Benue State',
        state_of_residence: 'Lagos State',
        title: 'Mrs',
        watch_listed: '',
        customer: '38e0e1c0-2318-4292-8180-b35345f6dd99'
      }
    }
  };
  return data;
};

export const zeehVerifyVINTestResponse = (user, vin) => {
  const data = {
    status: 'success',
    code: 0,
    data: {
      entity: {
        status: 'success',
        code: 0,
        data: {
          fullName: user.first_name + ' ' + user.last_name,
          vin: vin,
          gender: 'M',
          occupation: 'Banker',
          timeOfRegistration: '10-10-2010',
          state: 'OYO',
          lga: 'AFONJA WEST',
          registrationAreaWard: 'M12 DEKOLA ZONE',
          pollingUnit: '0UIH86FY',
          pollingUnitCode: '78-07-09-112',
          dateOfBirth: '31-07-1995',
          firstName: user.first_name,
          lastName: user.last_name
        }
      }
    }
  };
  return data;
};
export const dojahVerifyInternationPassportResponse = (user, user_data) => {
  const data = {
    entity: {
      passport_number: user_data,
      date_of_issue: "01/02/2000",
      expiry_date: "01/02/2000",
      document_type: "Standard Passport",
      issue_place: "LAGOS",
      surname: user.last_name,
      first_name: user.first_name,
      other_names: user.middle_name,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      photo: '/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a\n' +
          'HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy\n' +
          'MjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAHSAV4DASIA\n' +
          'AhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQA\n' +
          'AAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3\n' +
          'ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWm\n' +
          'p6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEA\n' +
          'AwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSEx\n' +
          'BhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElK\n' +
          'U1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3\n' +
          'uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDozwKC\n' +
          'OBTSacDximA3GaMCncUg60wGEUoFKaBQA3NLmgjNGKAFpQab3ozQBIDSg81FmlyaAJM0vQVHmnbq\n' +
          'BDhS1GGNPB4oAM80tIDSZoAfmnBhUWaKAJd/tQHFR5xRmgCTfSbzTAaWgBS5oLU00gyDTAdR2pKK\n' +
          'AF7UhFLkUmaAEFKQKKQkU7iF6Um4UwtzSH1pAS5FJnPSo+TTlGKAHU4dKaKUdKAFNKDzzSUd6AHk\n' +
          '5+lLwBxTegppbmkApc0zdmmlsmnquaYFbcQacGzTWHpTQcHpUlkwPNLwDUW455p+aBDs0ZpMUUwA\n' +
          'ijFFFACGjAoNFABRRRQAuaXNNooAeDS7u2KjzS5oAcDzS0wdaeOlIBCcUu4CkI4pD0pgKWozTKM8\n' +
          'UAKRnmnKcd6j38UmSaBE28UeYDUQBpaAJQcmjOOtR7iDRnJoAcTzSimUZoAcW4phoNFACij+VAoF\n' +
          'ADqXvTetKo5zQA8UopBSgUAFKDg0lNZgtADiajLEnApMljjtT1XFAAi81Oq8UijvT+1AFFlqIjB5\n' +
          'qfNNOKRREWozilYUygCQPUgOarE4pVegLFg0gpgkBpwcGgQ6ikyKMj1oAWkNLkUUAIKKOBRmgAop\n' +
          'M0tMAFOBptKKQCmkNITSZoAWgikzRuwM0AAWl6U0yU0saYD84pN9M5alAAoActGeaQvTNx7UASBq\n' +
          'Bmmr9KcKBDhmloooAXFJRmlHNACinCgD2pRigBRRmkzTWYY4oAUmmbSxpN1OGTQA4L6U9RzQop4F\n' +
          'ADhxSM2O9IxxzVeR8HmgBtFGaM0hjTimkU8jJoxQMhK03HNT4FJgE0AQUoNPKDPWkKEUhhmnZ4pm\n' +
          'MU4dKYrD6Kbup3HrQIKM80NyKQdaAHHpRmkJpM0AOBopo60vSgB3ak20Z4ooAAKQ9aN1BIzzQAmB\n' +
          'SgLSHFJnjAoAfwKTA9KYeaXmgBQoJ6U7C+lJxSYIPWgB9GRTaWgQ7dRnnmminigYoUdTTwBSAZpe\n' +
          'lMBaQ4FIWxUZagQ5jzUZpGbNKoJoGKoqZRTFSpQuKQDlwKcGAppIAqJ5PSgBJZQAaoTTHPNPmkOD\n' +
          'xVGQs7cUAawOaKrq9SrJzSGPzRSZpaYCEZ6UwqfWpKTAz0oAYQfWkIPrUh+lMIOelIBnNKOlKaMC\n' +
          'gAA60UdKM0AOGaTODSZoFMBRk0YoJxRuoEKOtKaYSc9aTOTQBIOlITxTKCaAHZ5owDTCfej8aAJN\n' +
          'oIpBgU3JPSgAmgCXA9KUAYqMEilBOc9qAH7QKMCkyMmjNAC4opO1KKAHACnUwdacTQAu/BoLCoya\n' +
          'RjQA4tUTMM9aaWozntQA8DipFGaRakQcUAOA4p3ekzikLYHWkAjsKpyyYPWnyyYqhNLngGmAyack\n' +
          'kDnNLEhIzUcaF2zV1EwtICNWqUOKhYYoBoLLIk5xmpQ/vVMHFPDnNArFzNFQCSpN9Ah5IoODSZow\n' +
          'CaYAVBqMrUuBSYpARjnrSEYp5Xmm0AJik704UnegBM80UY70yWVIl3O21fU0APzUM1zFbqWdwK5/\n' +
          'UvEWxjFbke7Vzk+oSTMd8hJ9M1LkkNRudTdeJkjyIowx6ZJrKn8S3TkgMq+wrAeQ4BbgZ7VH5iF2\n' +
          'PIx61F2Vyo2l167U7vOINSL4gvd4bzcj3rn3dzhhg5oM6ouGJJPTFF2FkdhF4rbYN0YyOprQi8TW\n' +
          'rgblINcEs2F68/SlSYgkbjzT5mS0eoW19BdKGjcH2q0D6V5jBezQMGRyMehro9O8SkOIrgZH94VS\n' +
          'mKx1ZzmlAqO3uYrhd8Thl9qlzk1YhR0paQUZoAXigkU0mo3cCgBWeoy3HWoy+aACaAJOtSItNVeK\n' +
          'nQUAOUU8HFJ2pCeKAAsMVBJIAOKV3wKqSycHmkAyWUDNVBmRutLI5Y1LBGMZoAmhj2irCrmmKOKn\n' +
          'QYoAqsveomFWWGRio2XFBVyENing5pjKRTQxFAybJp4c1CHpwYHvQIsCSplYE1TBxTw5oFYt0VAs\n' +
          'uKmV1NAWA00jmnn1pMZoEMIxTSKeap317HZQl3POOB60AM1DUEsYd7Hk9BXGahqlxdsSzkJ6Cmaj\n' +
          'qUl5MWcn2X0rNaXc3fA7VnKRrGIpkDEg5Ge9R4Xbz6/nQ7BwTnnsKgctwvQetQOw+aT5cKBuzxUe\n' +
          'SQN34+9RyMu7IycVH5+ThkOKpATOzknYwXHakLkrtGM+pqvhmUvnGDUhTIOxgT3p2JY9J2IyxGOh\n' +
          'xQk6AEoSRn0qPA2soBGPTvRuwmPugevenYksxzsu3GBnsal86SOTOM56VRQkPkEYx3qdZRnJ4pWA\n' +
          '3NM1eawmUhiATllPeu507U4r+MMpwe4rzGNxtOefetPTtRexlV0fn09aE7AeljNBYAVnWGqRXsAZ\n' +
          'SA3cVYaTNakj2k54qFmyabkk0oFIAANTItIq8c1Mg4oAcq4FPHFJQTQApaonfA60M4FV5H60AJJJ\n' +
          '71RkkJJqSR81DgsaAFjUsauKuMAU2KMACpgvNAEqLU1MUYFP7UAiIjI4phAp/tQRTAhZM9KgaOrZ\n' +
          'phUGkVcpkYNICQasvGKhZaAHLJ608EZzVemiQ5xQMucGlBYHNV1kPeniSgRYExFSCQ4qsGyOaeGU\n' +
          'd6BWHTXAgiMjEDaM1wmqalJezszZ254WtLX9T81/s8TfKPvYrnvLdz71lUnbQ1p07kLKPMDE8011\n' +
          'OcHjPStIafkByc+1P+wsy5IzjpWHOdCpmEA8chyePeo52Mm1VOK3jphkGSMGoH0Z0A2iqU0J0jEG\n' +
          'xG5zwOvrSGZScgfSttNAmmfJAwOlTr4bIXn1q+YnkOezlSW4HpUIU5OzjPNdafD5kwuKibw4yOAP\n' +
          'u01IlwOWBmjIZgelShgwJlGQeldqvh6OSEAL25qI+EfMzzhccCndkOKOLJU/KpwakVVQYQ7snPPe\n' +
          'tmbwncITtUg5xVH+wLxJdpyBTuRysiRiDuAAHTFTxsARmnrolwkmCxI9akisZgSjKeO9TdBysu6V\n' +
          'qEljOGzkZ5FdnbXqXce5DXASRmB8kE5rT0bUDbXahj+6bgg9qqMugmjtlFSqvIpI8MobOQanRea0\n' +
          'JBVOakxilAGaQ9aAAnAqNmpWYVCzdaAEZsVWkkpZHxVVmyaAFJyamjTODUUa5NW0XgCgB6rUqjmk\n' +
          'UcVIooAeBS0UCgaIAc0tRI1PBzTEOpKXPFJQAhGRUTJU1NIzQBWaOoSuDVxgM1Ey5NIpMr4Ip240\n' +
          '4rTCMGgY4NiqWp6iba0bGNzdKtk4HNchq10016yg/KvFS3ZDirsq5M0xds5Y5rTtLcN8xFVYICVy\n' +
          'MVrw8AdOlcc5XZ204pIeLdTwOlSLEAOO1SL0pwqDQZsGOgpojG7kVOq5pwj74poGNjXHbg1KEVe2\n' +
          'aauV+lIZgDWqZlKJYVABnikMYkGM4qv9pVjtzinCUHjNXdEODLUI8vAB5FW0w3U81l+bt71Kt0uO\n' +
          'tWpIxlBl9wuMECs+5iTdkAcUNc5P3qglmB6Ghu4lGxAYkBIpDAp4wKUkHmng8Vm0O5n3WmpKvA5F\n' +
          'Y01u8DEnoMV1ZHArPvLcSIQR1HWlcGkanhu9N7ZlG+/Fxj2rfAA4rg9AuW0/UhGzfK52mu5Ztp4r\n' +
          'oi7oxY8mmM2aYZKYTVCFZgKrPIBTpJOOtU5HyaYA75poBNNHNTxrzSAliXirCimKMVKopgPUVIBx\n' +
          'SAcU4dKQC0UUGgZlq9To3FZ8cvFTpJRcpovA0tVllqVZM0EtEg6GkoBzQaYhCPSmEVJSHFICIgVG\n' +
          'UFT7RSFM0DKF2whtpHJxhSa4iIGaVm6knOa7DxCwi0mX1YYrkLLqM8Csqr0N6KuzRtUYMFNaCqQR\n' +
          'UEC/MWFWwc1yNnbFEqGpAKiT71SjrSQ2SqfanMxI6U1TinZyOapCI2ZsdKgfnrVhqrtTGV5FGcim\n' +
          '7iMVI3SmAjuOKBNEm8nnNBZiMClQozYNThU6HitEYyKRkI9aZ53PWr3kxsTUUtsvUEVRk2RJKDU6\n' +
          'MDVUwEHipEQjHNMzZZLEfSmSYdKaSw4PSk/Goe40Yt0DHPuXqDnNdrY3P2myilBByozXJ3qjJrR8\n' +
          'L3GIprdjyjblHsa1pszkjoiO5NRSSAUjye9U5ZhyK1IFll44qEHJpm4mpYlJagCSNckVaVcc1Gi1\n' +
          'YUc4pgOVeM1KopFFPBAGKQD6O1JkUmaAHUmaaTnoaaTQBz24g1IsvvURBz0pvQ8UjcvpJx1qdZKz\n' +
          'Vc1MsuKCWjSRzUgeqCS1MkgPWmQ0WqKjD+lO38UEjqM96ZupNxzQBzvjCXbb28QPLv0/CsG2UFSB\n' +
          '1HpV/wAXvm8h+Y8L0qjZ4Rcr1auetuddBaGvbjgdqtAYqrESoGasKa5ep2WJkHNSD2qOMEmrKRnP\n' +
          'FMGNCn8KePSpVj6UMoBzVCsVXJ5qu/XrV2QAjgVUK/NzSuOwzGRTSgqRsY4qE5pNhYULg5FWFOQK\n' +
          'qhyM1IjmqUjOUblxFB5xTZUyOBUaOfWgzH2rVNGEojCpApvSpBJk804gNVKxm0yEnIpO1SNHioZM\n' +
          'gUpErcp3gDKTiq+gzbNWKnjcpqxNhlJNZVlIYtXjx0yeaKb1CaOxlmxwKrBtxppJY5pyLXSYkiry\n' +
          'KuRJiooUA6mrSDAzQA9FqYDFMUVIOtACjrTyR6U3vRQAu72ozk0hPFNzzQMdnBxTSaXvTGbFAjGd\n' +
          'agYYq4y5qF1pGyK+aXcRTmXFRMDikMsLL0qdJazwxFSLL707isaaS1IJaz0k96mWTPemQ0XVcGlq\n' +
          'qGPanCXbxQS0cn4tX/iYRNzytVrQHIGcgVc8WAtcW8nbBBrPtC2Fx1BrmrbnZQ2NuM/LzVhDk1Vj\n' +
          'PrTzMIwScYrmsdRdEyQ4BPNSDUokU5IFc/PdNLIPLBPbNQSeco+bODVKwM6pdTh2khgaadQhkGQ4\n' +
          'rkHuHUEHIOKgS6ZD3xTsTdnZm6XsR+dQm4DHFcv9vkULtYnnmrB1FgVxxUtFXNwyYPWmmTjOazku\n' +
          'iw60rT54qHcuxb83nk0huQOBWe82KZ5mR71WpNjUW6CjrSNc7u+Kx2uAp5aozfojdc01czkkbguP\n' +
          'mxmrMN0AcVzEurBfaoP7YbOQDW0Ys55NHcNMhUHNRuFlQkHpXIrrTYxmtOw1ZGyrnFW1oY9S5KmF\n' +
          'IrFgB/teML/e5rcaVJoWZCDisWw3S6yABnGSammtQk9DqI14weasRoMdKijU8VcjSuoxHIvSrCji\n' +
          'o1GKmTmgB6inUAYFBoAB1pc00GigY4mkphJ7UZPegBxYAVCxJPWlZhTDk9KBFd4+9QsvFXCKhZMn\n' +
          'igtMpshxUbLxVxlqF09qRVyiwIphJq06VAyHmkUmIkhB71YSXFVCGHSkDMOtA7XNOOYHvU+dwrJS\n' +
          'XBqxHcYPJppkOJR8SxA2sbZAw3WsWyUlhzXQa2i3OkSgcsoDCud01i0m0dOtYVUb0WbBYrHjuah8\n' +
          'sySHccCrEmFSsq91AW4wnLHtXI3rY7YrqzajW2ijAcqCKjnntcffXHua5xLgBt90zSO33YkNRXOo\n' +
          'ypIYo9PCnjAarUW9BSlFamldSQMTh1/Os9nA4HNZNzqMgldJLcKVPIBp3zoquQ8YYAgnoa0VNoy9\n' +
          'rFvQ0lkUHpinlg5yKoJMx4cZ96u26+Z0FQ0ax1LULtmrAY5qS3tWcdKuNp7bMgGsr6mtrIypCc1G\n' +
          '0hUGrktsyAnB4rNn3c5qjFsidwx61UkLc7OtP7nnio5J1jOFGTW0UZS1GpavI2WYn2q9Fpu7lmwK\n' +
          'piS681USJ2JUMABjiov7YeOVlkRxtOCCau0mZXgtzYOlRjkNUbWzRElTkCqf25mAO50B6E9DTxeO\n' +
          'hDOwaM9WHap95A+VmxpV2d7RHJDA/nVnw6ga9nmYHjKioNOjR3WRcd62tBtitszsOWYmrp6swqaG\n' +
          'xGoPNWFGO1NQYFTKK6DEUdKVeKO1HSgCTdSbqjzzQDmgZITmk3EU3NJQMfuPNNJPrSZpCaBMDx1p\n' +
          'jHPSh27U0E+tAiU4qN0yM1Lim4NA0VylRslWXTFQsKCkyBkBqF48dqt7aYUpDuZ7rjtULLmtJocn\n' +
          'ioGh9qTLTKBBFPjBPfH1qZoq5XxFdXNtcIsTlVPcVE27aGtNKT1OhuZzGGjkT5GUjI5rF02MreEA\n' +
          '5Ao0+8uZrYGX5wK0YEia5MiDHy4Irnc21ZnSqKjqiadSY+Kxrm2kkbKIS/YmunjiDqBU8dku3OOa\n' +
          'wvrc2WxieGdKs4L/AHXrgy4ypbpU/jbQJZ9t9pwDALh1U9vUVYurQo+4DI9Kqy3LqrKPM57AmrjL\n' +
          'W4p07o4iy0e6vbtY2jMYJ+ZmruNShsIdMjtnaMhFArOkjdvuoRnnk1ELd8/Ng/XmtHNswjRUTNms\n' +
          'I1XzIJcj+6BWvpdvE8SNgiQHDCpI4jwFQH8K0bOxkj+ZgMnmocjdIuW8MaMP5VoiISJjFVIoizD2\n' +
          'rRhHFZrVlS0RQutOBhJOK5HUrVo3bHSvQrhQ1tjNc1f2ucnFbcpycxxDnaCTx7Vb0m0tDceZdTDC\n' +
          '8jjir1zpe8hgucHNTx2iBMFOapvSwLcm8T2wurOC806RN8KbGVDjK1xltp82oStHHG6ylu44xXWv\n' +
          'AQCFHHpVcCeDlDj6CqU2lYU6SeppnRLWLTEhnKnYvJrlpNPa2kJQ74SMYrXH2mfALMa1LLTwyEOu\n' +
          'c+tLmbIcUjO0gbSqgYFdJb3axII44zgdWbgCqosRBICBgVzGvajc297JBGxAFOErMzklI7+3vY52\n' +
          '25Xd6Zq8teY+EZ7mfXgrSMygZOa9J3HNdEdjGUbaE5pMioix9aAc1RJIMZ60cU1adwBQAtITxSdu\n' +
          'tIaBik01vrQTxTGOKBAeT1o+XvmmAkmngetAiXdRupPL460vln1FAw3ZOMUx1FP8v3pDGPWgCE4F\n' +
          'MOKlaMZ603aBQMiprL7VOQM9KTaDQMpPHnOBXK+KrRyiyqvA9q7UrjtVDVLIXVnInO7FRJXRrTna\n' +
          'RyukvssiT061o2E0c0jlRjnmsvT42CXFuR80dWdGb95Kp7NmuBrU9S94nTQjkVfiGB1rOiIABzV2\n' +
          'Nx61k3qCWhK6KRyKpzxxAcAVZZi3SoGgd2wBWiBme8e8/KtPh0tpTlhgVrQWXGTnIqxgIABTuCKM\n' +
          'VhHABheacQM4FWZSAmapbvmJ61MikSxptarMYzkAVXibd2q7bKPNG7oaIbkT2HvDm1yax7kAgiuj\n' +
          'WIPZyEc4Nc/cjaxBFdMjiKIjA/Gla3RxxgGmmTDY/h9akI6ODxUjRl3NrJESR0qmJcNhq6Hh1wwr\n' +
          'Pu9PBG9DUmidiO3kiz0Fa1tJERjIFc6P3bc1bjugvei4pQubVwVZeCK4XxOoXUg3qldSlyXOOK5X\n' +
          'xIDPqqQoCWKgcVUXdmVrGt4CscG4vHXBPyrXa1m6BY/2fpUcRHzEZNaR612I5ZO7DFHTpQOaMUyR\n' +
          'wOKdnIpMcUDA4oGISaCeKCRTM0ABPFRM2TTnPGKYOtBLJEHFSCmqOKeOaAAMRSh+KjpQKBkm6jOa\n' +
          'YaM0ADDDU3HNLS4oAYRSYFOPWkagoSjGQaaOvPSlGO5oA5q+sxZaqtwq4jl+Vqz7RGtNUmjZSFbk\n' +
          'H1rq763S5tWU8kDIrCUE/LKAWX7r+o9K4q0Wnc9HD1OaFmXUk4GOlTJMw96z0k7U8XGDjNcjVmdU\n' +
          'XobNtl+TWjHggdBisG3ucDrV+G43dDVqQOJpPJg8d6ruQOTSmX5MmqM8rNkKaq4kh083mtsToKiU\n' +
          'OXwFOO9CSw2q7peTUUniSyVtoKhvrUXu7FbGjCnz9KvNiNQy9RWHDrEcnIYVaOpxmIjOaq1iVqXo\n' +
          'dReGGUFMqxwaptIlxnPBrJkvnAYBuDVJ9SKnIaqUujMZ0+ppSwupZduVNUkke2kMb5KnoaIvESRL\n' +
          'hihPoaWbUba/TAQLJ2IPFU9DJIsiUHmlMwCms2ORk4Jp7zYUkipuVYLlY2JK9cZrOlYoKle4HJqj\n' +
          'LJuNDHexetJCW56VZ03TBea1LeSj93GQFz3qlZDMgA78V19pCLe3VB16mtqEbu5yVZFgtgUwMWPt\n' +
          'RncacAK7DmFzgUopAOKXOKADJoz3pO9LQMTNNY4pxqFm5oEDHNORaYOTUyggUCHCpB0qMVJ2oAiJ\n' +
          '4pAaWm9qBjs+9GcVEcg5pd+RigB+aXce1MzilVu1AC7vamlvalJ5oPIoGN3cUwmnhc01ht4oAbux\n' +
          'Wfdxqu5hjB/SrzDNRugZCGGc1E48ysaU58rOe3kZpA2D70TDbIwHrUBc5rzpRsz1ISui9HIRV+3k\n' +
          '44rHibcQK0YOlZM2uaokytKkRbkio7VC9aDbUTFaIls5bxBHPGh8sfIR19K4aXSLyeQuhZueoNeq\n' +
          '3BUqQyBgexqCGC2jBKxAE9quMuXYmUVLc4KxttVshlsvH/dNbQuXVNxBBI6GukdImB+QCsi8tlfI\n' +
          'HFDfMCtFaGXJfMFOTWRe3dzIpFvGf96t9NJQ/MxJpzWgIwFwB6VUbIyqSbOKjsLy4l3yuQfXPFdD\n' +
          'pMEodUVt2Opq8bRDwygitSwjSIAKgUY9KuTuYqyEkiwucGqUhODzxW06g5OQfasq7QR8qAfaoasN\n' +
          'S0MuQkcZ5qLknpViRMseOKaFx2oIkzR0pN11EMd66wjNc1og3XQPoM10w6ZrroqyOSq9RVGBilFA\n' +
          'pa1MwooooGBpOtIxFN3EUAK31qM0pOTSgZoEKozUmaaBgU4UAOGMUuabTs47UAMNR5qSo3FAC5DD\n' +
          'FMKkHim52mnbyaBibuaAaQ80nIoGSA807NRilxxQA8HimnmkGTxTiDjmgBmOKQrzz0p3elxQFzmd\n' +
          'QTy7mQYxzVI1sa5FtkWQjqMGsU5xXn1o2kenQleKJY2wRWjAemKyY2G+tCF8AVi0dCZuQShUGTzT\n' +
          '2uAaxmuSo460Jc7mGWxTQM1HlzUQ3OOMiiMoVG9hg0rXdrbjG7JHar0JsxwibYe5rJ8ufewl9eMV\n' +
          'bbWTyEjGPWo11CGVsSDB9aYnFk0UXyHNJJbHZx3pr3sEC5Vtx9KpPrLlyVHy+lEdyJq6JxEFOCKe\n' +
          'GCCo01e2cYkG002aeFlyjZrW5zNNEpuQOtVp5A9UZJ+SD60JJuqWCFlG0VW3HPFTXD9qq5PbvSSJ\n' +
          'Z0fh2PJeTsBXQgAdqztGg8jTk4wzfMa0A/r1rspqyOWbux1FJnNBOKskXNMZqC4zTCc0AGaQmkNA\n' +
          'FACgc1IBmkQYp4HNABSik70vSgBadTO9OBxQMhVvWlPNRgg96XNAhCBTSKdTTQNCZxS5oxSEUDAP\n' +
          'Tw9RMtJkigCxuFIGqINmng0AOJ+alDYNMJCjcSMD16Vy+ueLYrJTFaESTdCT0FAG9q3kvaOHdQw5\n' +
          'GTXKls881xl3qt1eSl5pnY5zjNdLpjyPp0Ujg8jByK568bq514adnYvLjOatRv8ALVJT6VMH4rka\n' +
          'O25I8oByTVCbVRA+W4Ap025+Aakg0yC8Uxyj5j0JpxS6hJvoVjrDzn5S23tip4roHliSfetaz06G\n' +
          '1QRtGpx7VbOmW02MKAauyGm3uYf2tRTTco2SMVoXPh9HBO4j6GsyTQZk+5IcGnZBqMe5B4yKrtcq\n' +
          'D1FWY9BnZsGU4qQ+G16vORiqUTKbZlyXKjk0yPUMNjd+taz6HbKuGBJPfNU/7CiRjIThB2q+VHO5\n' +
          'Malxvbk1dt371lFAkny9M8VfgbCms3ETY+eTLGrGlWhvL1E/hHLVSWN7iYRxjLMcAV2ek6aNPtip\n' +
          'wZWPJ9q0pwuzKcrKxoKNihV6AYFBXv3pCTmjcRXSc4u7ikL0xn9qjJNAEhbmgtzUYUnmpAKAFHSn\n' +
          'AUAUvegBwp1MGacDQAopaKKAFoNJRQMpq1SA5qsGBqRW96B2J6TFNBzTqBCcZpCOaXFLigBpphU+\n' +
          'lS4ppZVGTQNEJyD0oa4WGMu5CgdzWbqevWmnjbuEkx+6in+dcbqmuXN6G3vhP7i0rjLniLxTJNug\n' +
          'tW2xdCR1NchGlxeziKBHlkY/KqjJrX0LQLrxJqaWsIOGPzN6Cvonwh8P9H8PQLKIVeUDJkccmpck\n' +
          'hqLZ554F+D5dRq/ib91bIN6257j1Y9hUfiSfTbzVZRpkapZIPLjCDA47iuw+LPik2+jrpVlJte6I\n' +
          'VivZe4rziKJYbdEXooxWFSVzpowsymyNC2D07GlLZqeVQ6EGquMZB7VgdguRUiylSGXqKiI4qIvt\n' +
          'NKxSNyO9WVQC3zVKJnVgc9K5kzMDuU4xUi6tJGOeRTSY1JHSS37kYqL7W571hDWk/iQ/lSHW488K\n' +
          'RTsx88DYFxICTmmvckjk1iSa2h4AP5VXk1YsPlU1aizKc4Gw9yehOBVK4vGddoJxWebuSQ89KEY/\n' +
          'WrscspIn4HWp0bbGT2qug3HmodTmMFgxU4yduaFroZSZ0Hh3U9Nhum+0SBJTwrN0rs0ljlGYnVx7\n' +
          'HNeJQuSDG557f41Ytr+90+T/AEa5ljfqNp4P1rpirI527ns5HFMINedWPjy/jwLhUl98YrptN8Ya\n' +
          'fesEmY28p4w/Q/jTEbwTIoCU+NlddysGUjgg5FLxnigBoWl20+loAYBS0pNMHBoAdmlzTOhpc80A\n' +
          'OzS4pAKdmgAoopCcUAY28inrKBSNHxULblpGheSZasLIpFZAkKmnNqENum6WVVHuaYrGuCCKa8kc\n' +
          'SlpHVQO5NclfeL44kYWyZPZmrkNR167vG/eSsw9M4AoJO81LxfZWilYf3z+3SuUvvEt/enAcop42\n' +
          'qa5xSzAyOT7Vat1OC7fhSGiwWwCzHLdyTVb5rqcRJzzTp5MJTLBpmuUSDhieTSsNvU9i8DwWXh3T\n' +
          'jdTFTMwztHU17BZTLcadDMyj50DY9M187xyfZrSOHeXlkYKST719DWieVpcEfpEo/Ss5xsawlc8l\n' +
          '8YTW81zPG8CszzEKT/CBXLy8cVueJOdT/wCBu3/j1YM5+auaoddLYgY45qB/m5qRz2qFjjmoRvYR\n' +
          'W5waVog5wKZuDc96ckv50MNiGS2YdKrSWz9ga1PMGOaerx45FNSBxuYJt2z92kNucZxW1K8eMACq\n' +
          'jON2OK0UjNxM82xz0NN8gg9K1C6hSSKZvQjpTUjOUUUlhI6ipFjqbjPWoWkwdoqldmTsidcBcd6z\n' +
          'dbObJU9WzVtWzVHVDviA9KcNGZSehjqxKBx1Xg/SpnYPEHU5Kmo7dcmRP9nNLFkIwFdCOdjJOCGH\n' +
          '8XWnJOR15HcVGeYz7GmUwOm0bxLd6YQI38y37xOen0r0LSdestWQeU+2TvG3BFeMhivSrVvdNHIH\n' +
          'R2Vh0IODQB7nxTCSRXn+jeNJoNsN8fMjH8Y+8PrXbWd/b30Ikt5Vcex6UAWQxpCeaCQBzxTcg9KA\n' +
          'F608DvQq+tPoAOooHIoHAoyKAEJ4pjNTieKhdsUAQbQRWbfalZWYPmSqW/ug81yd54j1G+JEZEEX\n' +
          't6VkvOseWZt7+rc0FXN698Qyy7hbqI1/vHrXP3WolyWZy7epqpLdPIeelVWPc0CuSS3DSNkk4qIf\n' +
          'MwHrTCacnAZvSgRKW3SBB0q6vCgCqEHMvNW9xFJlRI7hu1aukKttCZ2HztwvtWTIN0oHXNatvuJR\n' +
          'F6DtTRLOk0iM3OpW7OCQZFA/Ovo9OLQD0UfyrwDQIgl5bMx5Eq8fjXvpJFqw77f6VlU2Nqex434j\n' +
          'wNQU+zfzrnZzk1veIzi8jb1XP61z8xrlqbndR+ErMwyahbp1/CnuaiNQbjBjd6VMUDrxwajyCfen\n' +
          'KdtMLEMjOnUGozdFVwDzVx2DLg1Tmijb1FNWIfMtiFrrJ5NM87LU2W2A5D1XIKHrWiSMpOXUtPNx\n' +
          '1qMz44zVc7j1NPjVR15NUkjKUyUNI/SnICOtG7jAFN3elMzJN2KpXzbkqzuqheSdacURLYgsE3SS\n' +
          'nsE5qGIYdu1X9NjxYXMx9AKpRj5jWyZkyAZ+b0pvennK5z0qMmqJCnKcUgoI70ATK+B14q5Y6pc6\n' +
          'dN5lvKyH2PWs9Tnil9qAPRtK8Zw3O2O9Hluf4x0P19K62BkkjDowdT3U5rw9XK1t6P4ivNMf91KW\n' +
          'jPWNjxQB64ORTqxNI8SWOpqqFxFP3Rzj8q26AE3Ck3H0pGODTd1AATgGqsrjOKmlcAGqJfJoA8rk\n' +
          'uSVx0FVJJQajZye9RmgBzOe1M3E0lFABmnD7h96bTs8YoAntx1NWDkjpUUB+SpwOOaRSI+kqmtnS\n' +
          'gDIGPWsWThhW7pMfyg00Szs9OeNZLZsAESqf1r3KNvMg/wB5c18+2xKspHYg4r3jSpvP0y3l/vRg\n' +
          '/pWdVG1I8j8W/ub+BP8AfX8Acj+dc3M/FdZ8QofJ1GM4xiZh+YzXHyGuapvc7aDurEDHJpjPg9KV\n' +
          'mqFpPWszccW5zTlf1quX59qFfmnYdyd2OKrPIQDUhfK9aqSntTSIbGtKCKgZhmmvnPWozmtUjnlI\n' +
          'fu5qVDnFQAc1KDgVRkyQtim7jUZamF8fShIkkaTAzms+4fcDU7tngVXkUuyqByTgVcSJGvDD5Hhy\n' +
          'PP3pnZvwHFZEPzJn611GqwGKCG3XH7mHn64rlYeFPPNWtyJbD0CF1D/dzzTJI4xK4A+UHg0pPFCt\n' +
          'VEDGhHUGo3RlHPNXnaJrZFRSJQTk+oqsxNAEA/Kn5zUyMPLKFQc96Y0JB+U0AMzmlHBFN5HUUA5o\n' +
          'AtRXRjYc8Dv3H0rr9E8YzWeyO8Yz2/Z/4lrh8VJHI0ZyOnpQB7dBdwXsKzW8iuhHUGpDwM15Hpes\n' +
          'XWmTCW2kIH8SH7p/CvQtN8QW+qWoZSEmA+dKALt1KOgqsTgDPWmM2989aGbnFJgeP0hNFKFzTATt\n' +
          'RTiMCk7UAJS5puDmnbTigCzB9yrAbiq0H3TUwpFIRxyM+tb+nHYowawH+7Wvp7/KopxJkdNbtk5x\n' +
          '2r2fwhdC58P25zygKEfSvFbY8CvTPh3dfJcWjNnGGAqZq6NKb1Mv4sW5itorsf8APRSf5f4V54zA\n' +
          'qCD1FeyfEnS2v/Bt20YzJGPM/KvDrKYy249hXNNXR24eVm0OkfBNQu9OmDdRVdiehFZo6GO8ygSV\n' +
          'GaTNXYi5MZBUMj5ppaoXJHemkS2ObBphAFRM5FNLk1SRhKRLkCgvUOSe9Gaozeo8vTMljQqFjVuG\n' +
          '2JFF0hpXKwTmr/h2x+3+ILdCMxIfMb6Dmkkg2JkV0nhTTzaaRd6o4+aT9zF/U04u5ElYy9cnwt3N\n' +
          '2Zti1yqDapre8SsI3itgeg3N9awwPlOK0RlJiEhlx3p0cMjRu4AKp1NQgndU0cjKCASAeozwaokA\n' +
          '4+tPLRmF8r+8/hxSLF5jqqkZY4pJVMMjI33l4NAFcH5sHirlvKqyZkTclVhsZ/m4BpyNjjPSgCRy\n' +
          'Nx+X5T0zUbRK3K8VKNrYDE0+dIoZAIm3qR196AKjRtH2yKRWGeatK4xz0qVbSKaF33hWXse9AFRG\n' +
          'KHI6VoWdw9vKssTkEc4rPaFk5X5h7VJE4A64NAHommX6X1sJARvHDD0q5nJNcJpGoPY3qZ/1chww\n' +
          'ruEYEZHINKwHkwHNOBxTfpShCe1MBxCsM5waZ/KrC24x8xqe3jthJ++B2YoHYzsHNPUMRU0oQM20\n' +
          'fLnihegxQIIAQSDU4qNQQ3OakpFIRulaGnt+6BB56VQq3pp+d1/GmhSOks5SwXJ5rtPCt6dP1e3l\n' +
          'Ynax2t9DXE2agsD0NdLbNiMMDyKbQkz2+eCK7s5YJBujlQqfcEV8z3GmyaPrl5p0o/1UpAz3GeD+\n' +
          'VfQ3hrUV1HR4nJ+dRsYVwPxR0Dy72DWYY8Bv3cpH6GuZrodUJWkmjzyW2JGQOKqSWp64rfjQNGCe\n' +
          'cjio3twD0rmu07HoKzRzUkJXtUDAg4xXQT2wOeKzZrYqTVqRDRmtxURbJq7JDxVUxknArRMxkmQs\n' +
          'M0wg1ZEDntUqW3GSKfNYjkbKOxj2qWOBmIwKtpAWbAFattZKqDjmk5hGmUbayPGRWgloFXpVuKED\n' +
          'tUzbVHvWblcvlsZ32CS7nitYRmSVgg/Gu7vrGOws7exTAhtU59z3P51F4K01JLyXU5RlLcYj/wB4\n' +
          '9/yzTfGt6LPSLhy372YFR+NdFNaHLUlqeT6tdfbdRmm/hLHb9O1U2OFpTy5o8tppAiDJrVGLHW7Q\n' +
          '72EqkjHBHrUWT6cUh+U7T1B5pwbjFMQoyOQeRQQ0z/e+Y+tSzOjxxiNQpVcHHeoBkHNAEbZVselS\n' +
          'IQw5P41GQWYYpwUo5VhgigC3JCbdgrFTkZBU1GSDTc7gATS+W2zfg7fWgCZLWR4HnXBjQ4Y5pAR2\n' +
          'qNWIG3Jweoz1pwjLMAuSTQBPGhkdVT7x4A9ajkgBcq2VcHBHoacu+KQE5V1OfpSSsWcvkknkmgBh\n' +
          '3qdrcehrutCvhfachz86fKwrkbaZFJ8yMSKVKkHitPw9dx2U06sdquoI/A0COcWNUYjrinEj0ppG\n' +
          'DxSlGDYZSPrQMsPbGO2imLAiTOB3GKhc4FKSSAMnA6U1lYrnGR60hldvQU6Lgg+lMfKmlRsDFMRc\n' +
          'uLn7TIr7AuFxxTM0yJTI4QdW6UrZUlT1BwaQx2altJPLuhno1QKTT14mjPvTQnsddYHeVAAOa6FQ\n' +
          'IQqniuU0yQmVeOBW2JzNOPn4BqhI77wbqZsdSFpKcRz9PZq7zVtOi1fSZrKUArKnB9D614+HcIsg\n' +
          '+8vKn0NeseHdVXVNKhm3fvAArj3rGpHqbQdzxR4pbG8nsbgYlgcqQaU4Ndl8S9DaOaLW7ePtsnIH\n' +
          '5GuE83K5B61yVI63R30Z3VmMuMAGs+Tk1auHyDzVAtzmpSNJMjdMg1CIvm6Va3Z60mPmBqrktXES\n' +
          'EEdKZKmOBVoH5ajC7m5NIa2G20QBzitNWVUqrGu0GkdmoYWLBnGeKVVeaRY15ZyAAO5qsiknJrt/\n' +
          'BGkLJO2qXK5hg4iB/if1/CqhG7MqkuVXOlsNPTSdIhsR98DfKf8AaNeT/EHVxdaqbWJsxwcH3bvX\n' +
          'pvibV/7K0ee6ODM+QgP948D/ABrwW9d5JmkdssxyT612JWR57d3crZyCaYsjI4ZSQfWnkhetVzkd\n' +
          'aoke2GJYHrUpheONXONrdMGqwyamVmKhCTt96AFzRMxdtwGB0wKesTGF5VIKrjNRhiHBAzg5oAj5\n' +
          'B9MUDLHPU0+cl5C+MZ7Cog2DQBMKn8xjB5RPy5zTWlD26KECsOpHeo6ADkHk1LFIyOGBwVORS28q\n' +
          'xSZdA64ximMfmJ7Z4oAnlkaZ2kY5ZuTSK+0g9cetRqx7Yqa4dGZCiBRtAOPWgB80wkmMiqEBHQVC\n' +
          '8pUZojYFgG+73qKRgDheaABc7s1JNO8zAsegxxUW7pSkjPFABuOeOtS+ewgMXG080swhWOMx53Ef\n' +
          'NmoC3HNIZC5zQoUR7s/NnpSPjNNHNMRZR2Rg6nDDoaXcSSTySc5qGM9RmrJhdbdZiMKTigaEFDcM\n' +
          'ppAaVuQMUgZv6bKQvrxWxYnLHjOTWDZKUQZ6Gtqxf5h9ashHRs220PHOPWt7wdrI0+9WOV8Qynac\n' +
          '9j2rn2w9mQBUkSqIRjqMHI60mrotOzPZ7y1i1GxltplDxyKQwPevB9b0qbQdXm0+cHCnMbHoynoa\n' +
          '9b8J63/aNl5FwR9pg6843L2NVfHvhr/hINI8+2X/AE+1+ZP9te6muaS6HVGXK7ni8xNVCealaRss\n' +
          'kgKupwwIwQaiPJrG1jo5rhRmlxmkxSKTHbsrgVJGKYEPFTLxQWlcmUcUjAUm+kDM7qiKXdiAqgZJ\n' +
          'NIHZI0NJ06XVdQis4FO5jkn+6O5NeoIkFlax2cGBb264z6nuTWdo2kp4f0zyMhtRnXdcP/dH9wH0\n' +
          '9a5jx14mFjajTLNwZpB+8I6qvp9a6qcLI8+rU5nocz438RNq2pNFE2baI7VA7+9ccx5yeaklmjzw\n' +
          '2WP6VTZiSQT+VanONkf5qaWz0pRGXYBeCSAM064t3tpfLfG7GeKYBIylU2LjA596YCaAasQNBsk8\n' +
          'xSWx8n1oAYpO0jPB6inSRrHGjBwS3UelRgnPNKcd+lAEZORSMQQMDGKklVEC7PTmoTQBKjYqaLyy\n' +
          'rb8g44qFEHlltw+lOBoAN2DxT1YdxTQN7AZGScc0+SIwybGIJHpQBNKsKLG0ZJJ+97UgKsmDUQOa\n' +
          'c6mNVbOVagCSaJYZNqybgBnIqnIcnripidwznpVfG5zmgCxFH5sgUEAn1pRHsdlPJBxTVGOc80uD\n' +
          '1oGOPv0pz2siQLMw+Rjwaj2k5JBH1pXldlCFiVHQUgK0nXApgp0nQ0wHHWmIlDZfpU5lcxiMsSo5\n' +
          'xVUHvUw5oGiQc05gMD60xTTiflpAbMLYRFA7Vp2LHeOe9Y4b92pz0ArR0+YNcL7mqRKOuRmFsQBk\n' +
          'Yp9udqjNQByIto78U4Y8kYbBpjNTTtQfTLtL1FJMZ+Zc9Vr07TtUg1KzS7tn3I4/L2NeSW7GUlW6\n' +
          'EVo6Zqsvhy+CjL2kv3lP86zlG5rGVi14+8Em6Mms6THmbrPCv8XuPevLVc9GyCDgg19DW96k0SzQ\n' +
          'SB42Gcg1yHibwJZa073unstpeMcsMfI59/SsWk9DZSseW59DS5q5qPhzWdIci5s5Cg/5aRjcpqha\n' +
          'QXN7dJa28Eks7nCxqOTWbgzVVESB8U/fxmmJY38l21qlnO06ttKBDkGuq034d63dYe78qxh7vK3I\n' +
          'H0pchftEjm4xJNMkMSM8shwqKOSa9E0bQYvDaJcXSLPq7rlI+qwe596uWFhpXh1fK0mH7VfH5Wu5\n' +
          'BnH+76Vjaz4hXTi0Ns4udSk5ZjyIz7/4VtCnbU56ta+iJ9d19NGt3BcSX8oLbTzt9z7V43qeoPc3\n' +
          'UsrOWdydzZ6mtbxJcvG6o0jSTy/vJJGPJJrlZDyK2sczZImHkwScUh4Jx0FInSpY2QSKZBlQeR60\n' +
          'ySNTzmnMxkOWYk+tLcFTKxjXCE8CoxQBKtu5gMvG0cdaZuxwKUMdu3ccelPit3mfZEAWxnmgBYnU\n' +
          'Mdy5ypA9jUeGOSc8daM7Tj0p6SsI3jH3X60AMbGMUzaNu7PPpTih5bHGcE0w+lACqRnHrUgjZzhB\n' +
          'mocc8VPC7RtuU4NACAFTz2p5bf35qNt2c9fWhTnpQBIAcdDj1pZc7QfSneaxhERxtBzUbgsAg60A\n' +
          'NY7U69aSAEk/SmSElgPSprUZY/SgBe+akhYrMr4Bxzg1Eegp/wDdFAx88pllL4C57CoSeKe3U1G1\n' +
          'IVyNyMVG2MjFPbpUZOOPemA8NgYFSo/UVCKevUUATCndj60xT/On9aBl+N8WyHrWppibp1FY9vg2\n' +
          '/OeDWrpbEXa4NMhnWxB/urzx608gAHJ/CqgkJIA44oMjDA49KBmlbzBcD1NaF2sc0YUjIxWLbAkB\n' +
          'mOdp4rQlclMLyfT+tIvoO03VLjQ7naSWtW698V2UF/BeQrNC/BHUHNcYEGw5GSRyDVY28kfzWczw\n' +
          'v1wp4NTKCew4zZ6CJ59uAwce/NLA8yzK8UMMcgPDBADXnsGs6vZSDzh5q5xzW5a+LY8bZVnik9AC\n' +
          'QfpUODQ+ZHWS3d15hKpGjHq4AyTWRf30SRs93dhsdRnP6Vk3urXF7BsthJErfekl6j6CuY1COOBv\n' +
          'LSVpZm4JJpqA3Kxa1HxBc3jNBYf6Pb9C38Tf4Vn29koIODnPOTUlvbkBfUdeKkupfs9nNMB91Sf0\n' +
          'q7WITuefeIJjLrM57Kdo/CspvfrU8shmleRuSSTUON7UxMciMcADJPQU8qUYqwIYdQaFJR1KnBHO\n' +
          'adKxlcuxyx5JoER7snmpJ3EgG1duP1pkiGMgEg5GaaPagBATmpEZkO9WIOMcVLbtAFk85Cxx8nsa\n' +
          'gJIoAcEDMecYGajDU8UqhCGLEgjp70AG4mMrnioyD25ozTgxAOD1oAjBIpwPFNI5qSEr5i+YPl74\n' +
          'oAAxyOKfIwONo+tMcqHbb93PFIGxQBIGFMdirEg1LGsbRs5bDDoKqyNlyBQAikk5qzbMFJJqsvSp\n' +
          'kwqZ9TQBIe1P/iWiigGB6mo2oopCIm6Com60UUxjxT1+8KKKAJF/rUgoooGWoP8Aj3/GtbS/+Pof\n' +
          'SiimQdFH98UN98UUUDLtt/q/xq4P9Y3+7RRSKew9vu0yL+tFFC3Etgk/1h/3v6VPaqpkjJUE+uKK\n' +
          'KpjReuQBCMDHJrkm5v2zzzRRUjZdXoKp6wf+JLdf7h/lRRSGtjzbsabH1NFFBLHN9+m96KKYgk5/\n' +
          'KmDpRRQBJT4wDKgIyM0UUANnGJm+ppi9KKKAF/vUw0UUAKv36RuGOPWiigBzdBSUUUAPHVagk/1h\n' +
          'oooAD2qT+AUUUAf/2Q=='
    }
  };
  return data;
};
export const zeehVerifyInternationalPassportResponse = (user, user_data) => {
  const data = {
    status: "success",
    code: 0,
    data: {
      dob: user.date_of_birth,
      first_name: user.first_name,
      last_name: user.last_name,
      middle_name: user.middle_name !== null ? user.middle_name : '',
      gender: user.gender,
      mobile: user.phone_number,
      signature: 'base64Image',
      photo: '/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a\n' +
          'HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy\n' +
          'MjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAHSAV4DASIA\n' +
          'AhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQA\n' +
          'AAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3\n' +
          'ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWm\n' +
          'p6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEA\n' +
          'AwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSEx\n' +
          'BhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElK\n' +
          'U1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3\n' +
          'uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDozwKC\n' +
          'OBTSacDximA3GaMCncUg60wGEUoFKaBQA3NLmgjNGKAFpQab3ozQBIDSg81FmlyaAJM0vQVHmnbq\n' +
          'BDhS1GGNPB4oAM80tIDSZoAfmnBhUWaKAJd/tQHFR5xRmgCTfSbzTAaWgBS5oLU00gyDTAdR2pKK\n' +
          'AF7UhFLkUmaAEFKQKKQkU7iF6Um4UwtzSH1pAS5FJnPSo+TTlGKAHU4dKaKUdKAFNKDzzSUd6AHk\n' +
          '5+lLwBxTegppbmkApc0zdmmlsmnquaYFbcQacGzTWHpTQcHpUlkwPNLwDUW455p+aBDs0ZpMUUwA\n' +
          'ijFFFACGjAoNFABRRRQAuaXNNooAeDS7u2KjzS5oAcDzS0wdaeOlIBCcUu4CkI4pD0pgKWozTKM8\n' +
          'UAKRnmnKcd6j38UmSaBE28UeYDUQBpaAJQcmjOOtR7iDRnJoAcTzSimUZoAcW4phoNFACij+VAoF\n' +
          'ADqXvTetKo5zQA8UopBSgUAFKDg0lNZgtADiajLEnApMljjtT1XFAAi81Oq8UijvT+1AFFlqIjB5\n' +
          'qfNNOKRREWozilYUygCQPUgOarE4pVegLFg0gpgkBpwcGgQ6ikyKMj1oAWkNLkUUAIKKOBRmgAop\n' +
          'M0tMAFOBptKKQCmkNITSZoAWgikzRuwM0AAWl6U0yU0saYD84pN9M5alAAoActGeaQvTNx7UASBq\n' +
          'Bmmr9KcKBDhmloooAXFJRmlHNACinCgD2pRigBRRmkzTWYY4oAUmmbSxpN1OGTQA4L6U9RzQop4F\n' +
          'ADhxSM2O9IxxzVeR8HmgBtFGaM0hjTimkU8jJoxQMhK03HNT4FJgE0AQUoNPKDPWkKEUhhmnZ4pm\n' +
          'MU4dKYrD6Kbup3HrQIKM80NyKQdaAHHpRmkJpM0AOBopo60vSgB3ak20Z4ooAAKQ9aN1BIzzQAmB\n' +
          'SgLSHFJnjAoAfwKTA9KYeaXmgBQoJ6U7C+lJxSYIPWgB9GRTaWgQ7dRnnmminigYoUdTTwBSAZpe\n' +
          'lMBaQ4FIWxUZagQ5jzUZpGbNKoJoGKoqZRTFSpQuKQDlwKcGAppIAqJ5PSgBJZQAaoTTHPNPmkOD\n' +
          'xVGQs7cUAawOaKrq9SrJzSGPzRSZpaYCEZ6UwqfWpKTAz0oAYQfWkIPrUh+lMIOelIBnNKOlKaMC\n' +
          'gAA60UdKM0AOGaTODSZoFMBRk0YoJxRuoEKOtKaYSc9aTOTQBIOlITxTKCaAHZ5owDTCfej8aAJN\n' +
          'oIpBgU3JPSgAmgCXA9KUAYqMEilBOc9qAH7QKMCkyMmjNAC4opO1KKAHACnUwdacTQAu/BoLCoya\n' +
          'RjQA4tUTMM9aaWozntQA8DipFGaRakQcUAOA4p3ekzikLYHWkAjsKpyyYPWnyyYqhNLngGmAyack\n' +
          'kDnNLEhIzUcaF2zV1EwtICNWqUOKhYYoBoLLIk5xmpQ/vVMHFPDnNArFzNFQCSpN9Ah5IoODSZow\n' +
          'CaYAVBqMrUuBSYpARjnrSEYp5Xmm0AJik704UnegBM80UY70yWVIl3O21fU0APzUM1zFbqWdwK5/\n' +
          'UvEWxjFbke7Vzk+oSTMd8hJ9M1LkkNRudTdeJkjyIowx6ZJrKn8S3TkgMq+wrAeQ4BbgZ7VH5iF2\n' +
          'PIx61F2Vyo2l167U7vOINSL4gvd4bzcj3rn3dzhhg5oM6ouGJJPTFF2FkdhF4rbYN0YyOprQi8TW\n' +
          'rgblINcEs2F68/SlSYgkbjzT5mS0eoW19BdKGjcH2q0D6V5jBezQMGRyMehro9O8SkOIrgZH94VS\n' +
          'mKx1ZzmlAqO3uYrhd8Thl9qlzk1YhR0paQUZoAXigkU0mo3cCgBWeoy3HWoy+aACaAJOtSItNVeK\n' +
          'nQUAOUU8HFJ2pCeKAAsMVBJIAOKV3wKqSycHmkAyWUDNVBmRutLI5Y1LBGMZoAmhj2irCrmmKOKn\n' +
          'QYoAqsveomFWWGRio2XFBVyENing5pjKRTQxFAybJp4c1CHpwYHvQIsCSplYE1TBxTw5oFYt0VAs\n' +
          'uKmV1NAWA00jmnn1pMZoEMIxTSKeap317HZQl3POOB60AM1DUEsYd7Hk9BXGahqlxdsSzkJ6Cmaj\n' +
          'qUl5MWcn2X0rNaXc3fA7VnKRrGIpkDEg5Ge9R4Xbz6/nQ7BwTnnsKgctwvQetQOw+aT5cKBuzxUe\n' +
          'SQN34+9RyMu7IycVH5+ThkOKpATOzknYwXHakLkrtGM+pqvhmUvnGDUhTIOxgT3p2JY9J2IyxGOh\n' +
          'xQk6AEoSRn0qPA2soBGPTvRuwmPugevenYksxzsu3GBnsal86SOTOM56VRQkPkEYx3qdZRnJ4pWA\n' +
          '3NM1eawmUhiATllPeu507U4r+MMpwe4rzGNxtOefetPTtRexlV0fn09aE7AeljNBYAVnWGqRXsAZ\n' +
          'SA3cVYaTNakj2k54qFmyabkk0oFIAANTItIq8c1Mg4oAcq4FPHFJQTQApaonfA60M4FV5H60AJJJ\n' +
          '71RkkJJqSR81DgsaAFjUsauKuMAU2KMACpgvNAEqLU1MUYFP7UAiIjI4phAp/tQRTAhZM9KgaOrZ\n' +
          'phUGkVcpkYNICQasvGKhZaAHLJ608EZzVemiQ5xQMucGlBYHNV1kPeniSgRYExFSCQ4qsGyOaeGU\n' +
          'd6BWHTXAgiMjEDaM1wmqalJezszZ254WtLX9T81/s8TfKPvYrnvLdz71lUnbQ1p07kLKPMDE8011\n' +
          'OcHjPStIafkByc+1P+wsy5IzjpWHOdCpmEA8chyePeo52Mm1VOK3jphkGSMGoH0Z0A2iqU0J0jEG\n' +
          'xG5zwOvrSGZScgfSttNAmmfJAwOlTr4bIXn1q+YnkOezlSW4HpUIU5OzjPNdafD5kwuKibw4yOAP\n' +
          'u01IlwOWBmjIZgelShgwJlGQeldqvh6OSEAL25qI+EfMzzhccCndkOKOLJU/KpwakVVQYQ7snPPe\n' +
          'tmbwncITtUg5xVH+wLxJdpyBTuRysiRiDuAAHTFTxsARmnrolwkmCxI9akisZgSjKeO9TdBysu6V\n' +
          'qEljOGzkZ5FdnbXqXce5DXASRmB8kE5rT0bUDbXahj+6bgg9qqMugmjtlFSqvIpI8MobOQanRea0\n' +
          'JBVOakxilAGaQ9aAAnAqNmpWYVCzdaAEZsVWkkpZHxVVmyaAFJyamjTODUUa5NW0XgCgB6rUqjmk\n' +
          'UcVIooAeBS0UCgaIAc0tRI1PBzTEOpKXPFJQAhGRUTJU1NIzQBWaOoSuDVxgM1Ey5NIpMr4Ip240\n' +
          '4rTCMGgY4NiqWp6iba0bGNzdKtk4HNchq10016yg/KvFS3ZDirsq5M0xds5Y5rTtLcN8xFVYICVy\n' +
          'MVrw8AdOlcc5XZ204pIeLdTwOlSLEAOO1SL0pwqDQZsGOgpojG7kVOq5pwj74poGNjXHbg1KEVe2\n' +
          'aauV+lIZgDWqZlKJYVABnikMYkGM4qv9pVjtzinCUHjNXdEODLUI8vAB5FW0w3U81l+bt71Kt0uO\n' +
          'tWpIxlBl9wuMECs+5iTdkAcUNc5P3qglmB6Ghu4lGxAYkBIpDAp4wKUkHmng8Vm0O5n3WmpKvA5F\n' +
          'Y01u8DEnoMV1ZHArPvLcSIQR1HWlcGkanhu9N7ZlG+/Fxj2rfAA4rg9AuW0/UhGzfK52mu5Ztp4r\n' +
          'oi7oxY8mmM2aYZKYTVCFZgKrPIBTpJOOtU5HyaYA75poBNNHNTxrzSAliXirCimKMVKopgPUVIBx\n' +
          'SAcU4dKQC0UUGgZlq9To3FZ8cvFTpJRcpovA0tVllqVZM0EtEg6GkoBzQaYhCPSmEVJSHFICIgVG\n' +
          'UFT7RSFM0DKF2whtpHJxhSa4iIGaVm6knOa7DxCwi0mX1YYrkLLqM8Csqr0N6KuzRtUYMFNaCqQR\n' +
          'UEC/MWFWwc1yNnbFEqGpAKiT71SjrSQ2SqfanMxI6U1TinZyOapCI2ZsdKgfnrVhqrtTGV5FGcim\n' +
          '7iMVI3SmAjuOKBNEm8nnNBZiMClQozYNThU6HitEYyKRkI9aZ53PWr3kxsTUUtsvUEVRk2RJKDU6\n' +
          'MDVUwEHipEQjHNMzZZLEfSmSYdKaSw4PSk/Goe40Yt0DHPuXqDnNdrY3P2myilBByozXJ3qjJrR8\n' +
          'L3GIprdjyjblHsa1pszkjoiO5NRSSAUjye9U5ZhyK1IFll44qEHJpm4mpYlJagCSNckVaVcc1Gi1\n' +
          'YUc4pgOVeM1KopFFPBAGKQD6O1JkUmaAHUmaaTnoaaTQBz24g1IsvvURBz0pvQ8UjcvpJx1qdZKz\n' +
          'Vc1MsuKCWjSRzUgeqCS1MkgPWmQ0WqKjD+lO38UEjqM96ZupNxzQBzvjCXbb28QPLv0/CsG2UFSB\n' +
          '1HpV/wAXvm8h+Y8L0qjZ4Rcr1auetuddBaGvbjgdqtAYqrESoGasKa5ep2WJkHNSD2qOMEmrKRnP\n' +
          'FMGNCn8KePSpVj6UMoBzVCsVXJ5qu/XrV2QAjgVUK/NzSuOwzGRTSgqRsY4qE5pNhYULg5FWFOQK\n' +
          'qhyM1IjmqUjOUblxFB5xTZUyOBUaOfWgzH2rVNGEojCpApvSpBJk804gNVKxm0yEnIpO1SNHioZM\n' +
          'gUpErcp3gDKTiq+gzbNWKnjcpqxNhlJNZVlIYtXjx0yeaKb1CaOxlmxwKrBtxppJY5pyLXSYkiry\n' +
          'KuRJiooUA6mrSDAzQA9FqYDFMUVIOtACjrTyR6U3vRQAu72ozk0hPFNzzQMdnBxTSaXvTGbFAjGd\n' +
          'agYYq4y5qF1pGyK+aXcRTmXFRMDikMsLL0qdJazwxFSLL707isaaS1IJaz0k96mWTPemQ0XVcGlq\n' +
          'qGPanCXbxQS0cn4tX/iYRNzytVrQHIGcgVc8WAtcW8nbBBrPtC2Fx1BrmrbnZQ2NuM/LzVhDk1Vj\n' +
          'PrTzMIwScYrmsdRdEyQ4BPNSDUokU5IFc/PdNLIPLBPbNQSeco+bODVKwM6pdTh2khgaadQhkGQ4\n' +
          'rkHuHUEHIOKgS6ZD3xTsTdnZm6XsR+dQm4DHFcv9vkULtYnnmrB1FgVxxUtFXNwyYPWmmTjOazku\n' +
          'iw60rT54qHcuxb83nk0huQOBWe82KZ5mR71WpNjUW6CjrSNc7u+Kx2uAp5aozfojdc01czkkbguP\n' +
          'mxmrMN0AcVzEurBfaoP7YbOQDW0Ys55NHcNMhUHNRuFlQkHpXIrrTYxmtOw1ZGyrnFW1oY9S5KmF\n' +
          'IrFgB/teML/e5rcaVJoWZCDisWw3S6yABnGSammtQk9DqI14weasRoMdKijU8VcjSuoxHIvSrCji\n' +
          'o1GKmTmgB6inUAYFBoAB1pc00GigY4mkphJ7UZPegBxYAVCxJPWlZhTDk9KBFd4+9QsvFXCKhZMn\n' +
          'igtMpshxUbLxVxlqF09qRVyiwIphJq06VAyHmkUmIkhB71YSXFVCGHSkDMOtA7XNOOYHvU+dwrJS\n' +
          'XBqxHcYPJppkOJR8SxA2sbZAw3WsWyUlhzXQa2i3OkSgcsoDCud01i0m0dOtYVUb0WbBYrHjuah8\n' +
          'sySHccCrEmFSsq91AW4wnLHtXI3rY7YrqzajW2ijAcqCKjnntcffXHua5xLgBt90zSO33YkNRXOo\n' +
          'ypIYo9PCnjAarUW9BSlFamldSQMTh1/Os9nA4HNZNzqMgldJLcKVPIBp3zoquQ8YYAgnoa0VNoy9\n' +
          'rFvQ0lkUHpinlg5yKoJMx4cZ96u26+Z0FQ0ax1LULtmrAY5qS3tWcdKuNp7bMgGsr6mtrIypCc1G\n' +
          '0hUGrktsyAnB4rNn3c5qjFsidwx61UkLc7OtP7nnio5J1jOFGTW0UZS1GpavI2WYn2q9Fpu7lmwK\n' +
          'piS681USJ2JUMABjiov7YeOVlkRxtOCCau0mZXgtzYOlRjkNUbWzRElTkCqf25mAO50B6E9DTxeO\n' +
          'hDOwaM9WHap95A+VmxpV2d7RHJDA/nVnw6ga9nmYHjKioNOjR3WRcd62tBtitszsOWYmrp6swqaG\n' +
          'xGoPNWFGO1NQYFTKK6DEUdKVeKO1HSgCTdSbqjzzQDmgZITmk3EU3NJQMfuPNNJPrSZpCaBMDx1p\n' +
          'jHPSh27U0E+tAiU4qN0yM1Lim4NA0VylRslWXTFQsKCkyBkBqF48dqt7aYUpDuZ7rjtULLmtJocn\n' +
          'ioGh9qTLTKBBFPjBPfH1qZoq5XxFdXNtcIsTlVPcVE27aGtNKT1OhuZzGGjkT5GUjI5rF02MreEA\n' +
          '5Ao0+8uZrYGX5wK0YEia5MiDHy4Irnc21ZnSqKjqiadSY+Kxrm2kkbKIS/YmunjiDqBU8dku3OOa\n' +
          'wvrc2WxieGdKs4L/AHXrgy4ypbpU/jbQJZ9t9pwDALh1U9vUVYurQo+4DI9Kqy3LqrKPM57AmrjL\n' +
          'W4p07o4iy0e6vbtY2jMYJ+ZmruNShsIdMjtnaMhFArOkjdvuoRnnk1ELd8/Ng/XmtHNswjRUTNms\n' +
          'I1XzIJcj+6BWvpdvE8SNgiQHDCpI4jwFQH8K0bOxkj+ZgMnmocjdIuW8MaMP5VoiISJjFVIoizD2\n' +
          'rRhHFZrVlS0RQutOBhJOK5HUrVo3bHSvQrhQ1tjNc1f2ucnFbcpycxxDnaCTx7Vb0m0tDceZdTDC\n' +
          '8jjir1zpe8hgucHNTx2iBMFOapvSwLcm8T2wurOC806RN8KbGVDjK1xltp82oStHHG6ylu44xXWv\n' +
          'AQCFHHpVcCeDlDj6CqU2lYU6SeppnRLWLTEhnKnYvJrlpNPa2kJQ74SMYrXH2mfALMa1LLTwyEOu\n' +
          'c+tLmbIcUjO0gbSqgYFdJb3axII44zgdWbgCqosRBICBgVzGvajc297JBGxAFOErMzklI7+3vY52\n' +
          '25Xd6Zq8teY+EZ7mfXgrSMygZOa9J3HNdEdjGUbaE5pMioix9aAc1RJIMZ60cU1adwBQAtITxSdu\n' +
          'tIaBik01vrQTxTGOKBAeT1o+XvmmAkmngetAiXdRupPL460vln1FAw3ZOMUx1FP8v3pDGPWgCE4F\n' +
          'MOKlaMZ603aBQMiprL7VOQM9KTaDQMpPHnOBXK+KrRyiyqvA9q7UrjtVDVLIXVnInO7FRJXRrTna\n' +
          'RyukvssiT061o2E0c0jlRjnmsvT42CXFuR80dWdGb95Kp7NmuBrU9S94nTQjkVfiGB1rOiIABzV2\n' +
          'Nx61k3qCWhK6KRyKpzxxAcAVZZi3SoGgd2wBWiBme8e8/KtPh0tpTlhgVrQWXGTnIqxgIABTuCKM\n' +
          'VhHABheacQM4FWZSAmapbvmJ61MikSxptarMYzkAVXibd2q7bKPNG7oaIbkT2HvDm1yax7kAgiuj\n' +
          'WIPZyEc4Nc/cjaxBFdMjiKIjA/Gla3RxxgGmmTDY/h9akI6ODxUjRl3NrJESR0qmJcNhq6Hh1wwr\n' +
          'Pu9PBG9DUmidiO3kiz0Fa1tJERjIFc6P3bc1bjugvei4pQubVwVZeCK4XxOoXUg3qldSlyXOOK5X\n' +
          'xIDPqqQoCWKgcVUXdmVrGt4CscG4vHXBPyrXa1m6BY/2fpUcRHzEZNaR612I5ZO7DFHTpQOaMUyR\n' +
          'wOKdnIpMcUDA4oGISaCeKCRTM0ABPFRM2TTnPGKYOtBLJEHFSCmqOKeOaAAMRSh+KjpQKBkm6jOa\n' +
          'YaM0ADDDU3HNLS4oAYRSYFOPWkagoSjGQaaOvPSlGO5oA5q+sxZaqtwq4jl+Vqz7RGtNUmjZSFbk\n' +
          'H1rq763S5tWU8kDIrCUE/LKAWX7r+o9K4q0Wnc9HD1OaFmXUk4GOlTJMw96z0k7U8XGDjNcjVmdU\n' +
          'XobNtl+TWjHggdBisG3ucDrV+G43dDVqQOJpPJg8d6ruQOTSmX5MmqM8rNkKaq4kh083mtsToKiU\n' +
          'OXwFOO9CSw2q7peTUUniSyVtoKhvrUXu7FbGjCnz9KvNiNQy9RWHDrEcnIYVaOpxmIjOaq1iVqXo\n' +
          'dReGGUFMqxwaptIlxnPBrJkvnAYBuDVJ9SKnIaqUujMZ0+ppSwupZduVNUkke2kMb5KnoaIvESRL\n' +
          'hihPoaWbUba/TAQLJ2IPFU9DJIsiUHmlMwCms2ORk4Jp7zYUkipuVYLlY2JK9cZrOlYoKle4HJqj\n' +
          'LJuNDHexetJCW56VZ03TBea1LeSj93GQFz3qlZDMgA78V19pCLe3VB16mtqEbu5yVZFgtgUwMWPt\n' +
          'RncacAK7DmFzgUopAOKXOKADJoz3pO9LQMTNNY4pxqFm5oEDHNORaYOTUyggUCHCpB0qMVJ2oAiJ\n' +
          '4pAaWm9qBjs+9GcVEcg5pd+RigB+aXce1MzilVu1AC7vamlvalJ5oPIoGN3cUwmnhc01ht4oAbux\n' +
          'Wfdxqu5hjB/SrzDNRugZCGGc1E48ysaU58rOe3kZpA2D70TDbIwHrUBc5rzpRsz1ISui9HIRV+3k\n' +
          '44rHibcQK0YOlZM2uaokytKkRbkio7VC9aDbUTFaIls5bxBHPGh8sfIR19K4aXSLyeQuhZueoNeq\n' +
          '3BUqQyBgexqCGC2jBKxAE9quMuXYmUVLc4KxttVshlsvH/dNbQuXVNxBBI6GukdImB+QCsi8tlfI\n' +
          'HFDfMCtFaGXJfMFOTWRe3dzIpFvGf96t9NJQ/MxJpzWgIwFwB6VUbIyqSbOKjsLy4l3yuQfXPFdD\n' +
          'pMEodUVt2Opq8bRDwygitSwjSIAKgUY9KuTuYqyEkiwucGqUhODzxW06g5OQfasq7QR8qAfaoasN\n' +
          'S0MuQkcZ5qLknpViRMseOKaFx2oIkzR0pN11EMd66wjNc1og3XQPoM10w6ZrroqyOSq9RVGBilFA\n' +
          'pa1MwooooGBpOtIxFN3EUAK31qM0pOTSgZoEKozUmaaBgU4UAOGMUuabTs47UAMNR5qSo3FAC5DD\n' +
          'FMKkHim52mnbyaBibuaAaQ80nIoGSA807NRilxxQA8HimnmkGTxTiDjmgBmOKQrzz0p3elxQFzmd\n' +
          'QTy7mQYxzVI1sa5FtkWQjqMGsU5xXn1o2kenQleKJY2wRWjAemKyY2G+tCF8AVi0dCZuQShUGTzT\n' +
          '2uAaxmuSo460Jc7mGWxTQM1HlzUQ3OOMiiMoVG9hg0rXdrbjG7JHar0JsxwibYe5rJ8ufewl9eMV\n' +
          'bbWTyEjGPWo11CGVsSDB9aYnFk0UXyHNJJbHZx3pr3sEC5Vtx9KpPrLlyVHy+lEdyJq6JxEFOCKe\n' +
          'GCCo01e2cYkG002aeFlyjZrW5zNNEpuQOtVp5A9UZJ+SD60JJuqWCFlG0VW3HPFTXD9qq5PbvSSJ\n' +
          'Z0fh2PJeTsBXQgAdqztGg8jTk4wzfMa0A/r1rspqyOWbux1FJnNBOKskXNMZqC4zTCc0AGaQmkNA\n' +
          'FACgc1IBmkQYp4HNABSik70vSgBadTO9OBxQMhVvWlPNRgg96XNAhCBTSKdTTQNCZxS5oxSEUDAP\n' +
          'Tw9RMtJkigCxuFIGqINmng0AOJ+alDYNMJCjcSMD16Vy+ueLYrJTFaESTdCT0FAG9q3kvaOHdQw5\n' +
          'GTXKls881xl3qt1eSl5pnY5zjNdLpjyPp0Ujg8jByK568bq514adnYvLjOatRv8ALVJT6VMH4rka\n' +
          'O25I8oByTVCbVRA+W4Ap025+Aakg0yC8Uxyj5j0JpxS6hJvoVjrDzn5S23tip4roHliSfetaz06G\n' +
          '1QRtGpx7VbOmW02MKAauyGm3uYf2tRTTco2SMVoXPh9HBO4j6GsyTQZk+5IcGnZBqMe5B4yKrtcq\n' +
          'D1FWY9BnZsGU4qQ+G16vORiqUTKbZlyXKjk0yPUMNjd+taz6HbKuGBJPfNU/7CiRjIThB2q+VHO5\n' +
          'Malxvbk1dt371lFAkny9M8VfgbCms3ETY+eTLGrGlWhvL1E/hHLVSWN7iYRxjLMcAV2ek6aNPtip\n' +
          'wZWPJ9q0pwuzKcrKxoKNihV6AYFBXv3pCTmjcRXSc4u7ikL0xn9qjJNAEhbmgtzUYUnmpAKAFHSn\n' +
          'AUAUvegBwp1MGacDQAopaKKAFoNJRQMpq1SA5qsGBqRW96B2J6TFNBzTqBCcZpCOaXFLigBpphU+\n' +
          'lS4ppZVGTQNEJyD0oa4WGMu5CgdzWbqevWmnjbuEkx+6in+dcbqmuXN6G3vhP7i0rjLniLxTJNug\n' +
          'tW2xdCR1NchGlxeziKBHlkY/KqjJrX0LQLrxJqaWsIOGPzN6Cvonwh8P9H8PQLKIVeUDJkccmpck\n' +
          'hqLZ554F+D5dRq/ib91bIN6257j1Y9hUfiSfTbzVZRpkapZIPLjCDA47iuw+LPik2+jrpVlJte6I\n' +
          'VivZe4rziKJYbdEXooxWFSVzpowsymyNC2D07GlLZqeVQ6EGquMZB7VgdguRUiylSGXqKiI4qIvt\n' +
          'NKxSNyO9WVQC3zVKJnVgc9K5kzMDuU4xUi6tJGOeRTSY1JHSS37kYqL7W571hDWk/iQ/lSHW488K\n' +
          'RTsx88DYFxICTmmvckjk1iSa2h4AP5VXk1YsPlU1aizKc4Gw9yehOBVK4vGddoJxWebuSQ89KEY/\n' +
          'WrscspIn4HWp0bbGT2qug3HmodTmMFgxU4yduaFroZSZ0Hh3U9Nhum+0SBJTwrN0rs0ljlGYnVx7\n' +
          'HNeJQuSDG557f41Ytr+90+T/AEa5ljfqNp4P1rpirI527ns5HFMINedWPjy/jwLhUl98YrptN8Ya\n' +
          'fesEmY28p4w/Q/jTEbwTIoCU+NlddysGUjgg5FLxnigBoWl20+loAYBS0pNMHBoAdmlzTOhpc80A\n' +
          'OzS4pAKdmgAoopCcUAY28inrKBSNHxULblpGheSZasLIpFZAkKmnNqENum6WVVHuaYrGuCCKa8kc\n' +
          'SlpHVQO5NclfeL44kYWyZPZmrkNR167vG/eSsw9M4AoJO81LxfZWilYf3z+3SuUvvEt/enAcop42\n' +
          'qa5xSzAyOT7Vat1OC7fhSGiwWwCzHLdyTVb5rqcRJzzTp5MJTLBpmuUSDhieTSsNvU9i8DwWXh3T\n' +
          'jdTFTMwztHU17BZTLcadDMyj50DY9M187xyfZrSOHeXlkYKST719DWieVpcEfpEo/Ss5xsawlc8l\n' +
          '8YTW81zPG8CszzEKT/CBXLy8cVueJOdT/wCBu3/j1YM5+auaoddLYgY45qB/m5qRz2qFjjmoRvYR\n' +
          'W5waVog5wKZuDc96ckv50MNiGS2YdKrSWz9ga1PMGOaerx45FNSBxuYJt2z92kNucZxW1K8eMACq\n' +
          'jON2OK0UjNxM82xz0NN8gg9K1C6hSSKZvQjpTUjOUUUlhI6ipFjqbjPWoWkwdoqldmTsidcBcd6z\n' +
          'dbObJU9WzVtWzVHVDviA9KcNGZSehjqxKBx1Xg/SpnYPEHU5Kmo7dcmRP9nNLFkIwFdCOdjJOCGH\n' +
          '8XWnJOR15HcVGeYz7GmUwOm0bxLd6YQI38y37xOen0r0LSdestWQeU+2TvG3BFeMhivSrVvdNHIH\n' +
          'R2Vh0IODQB7nxTCSRXn+jeNJoNsN8fMjH8Y+8PrXbWd/b30Ikt5Vcex6UAWQxpCeaCQBzxTcg9KA\n' +
          'F608DvQq+tPoAOooHIoHAoyKAEJ4pjNTieKhdsUAQbQRWbfalZWYPmSqW/ug81yd54j1G+JEZEEX\n' +
          't6VkvOseWZt7+rc0FXN698Qyy7hbqI1/vHrXP3WolyWZy7epqpLdPIeelVWPc0CuSS3DSNkk4qIf\n' +
          'MwHrTCacnAZvSgRKW3SBB0q6vCgCqEHMvNW9xFJlRI7hu1aukKttCZ2HztwvtWTIN0oHXNatvuJR\n' +
          'F6DtTRLOk0iM3OpW7OCQZFA/Ovo9OLQD0UfyrwDQIgl5bMx5Eq8fjXvpJFqw77f6VlU2Nqex434j\n' +
          'wNQU+zfzrnZzk1veIzi8jb1XP61z8xrlqbndR+ErMwyahbp1/CnuaiNQbjBjd6VMUDrxwajyCfen\n' +
          'KdtMLEMjOnUGozdFVwDzVx2DLg1Tmijb1FNWIfMtiFrrJ5NM87LU2W2A5D1XIKHrWiSMpOXUtPNx\n' +
          '1qMz44zVc7j1NPjVR15NUkjKUyUNI/SnICOtG7jAFN3elMzJN2KpXzbkqzuqheSdacURLYgsE3SS\n' +
          'nsE5qGIYdu1X9NjxYXMx9AKpRj5jWyZkyAZ+b0pvennK5z0qMmqJCnKcUgoI70ATK+B14q5Y6pc6\n' +
          'dN5lvKyH2PWs9Tnil9qAPRtK8Zw3O2O9Hluf4x0P19K62BkkjDowdT3U5rw9XK1t6P4ivNMf91KW\n' +
          'jPWNjxQB64ORTqxNI8SWOpqqFxFP3Rzj8q26AE3Ck3H0pGODTd1AATgGqsrjOKmlcAGqJfJoA8rk\n' +
          'uSVx0FVJJQajZye9RmgBzOe1M3E0lFABmnD7h96bTs8YoAntx1NWDkjpUUB+SpwOOaRSI+kqmtnS\n' +
          'gDIGPWsWThhW7pMfyg00Szs9OeNZLZsAESqf1r3KNvMg/wB5c18+2xKspHYg4r3jSpvP0y3l/vRg\n' +
          '/pWdVG1I8j8W/ub+BP8AfX8Acj+dc3M/FdZ8QofJ1GM4xiZh+YzXHyGuapvc7aDurEDHJpjPg9KV\n' +
          'mqFpPWszccW5zTlf1quX59qFfmnYdyd2OKrPIQDUhfK9aqSntTSIbGtKCKgZhmmvnPWozmtUjnlI\n' +
          'fu5qVDnFQAc1KDgVRkyQtim7jUZamF8fShIkkaTAzms+4fcDU7tngVXkUuyqByTgVcSJGvDD5Hhy\n' +
          'PP3pnZvwHFZEPzJn611GqwGKCG3XH7mHn64rlYeFPPNWtyJbD0CF1D/dzzTJI4xK4A+UHg0pPFCt\n' +
          'VEDGhHUGo3RlHPNXnaJrZFRSJQTk+oqsxNAEA/Kn5zUyMPLKFQc96Y0JB+U0AMzmlHBFN5HUUA5o\n' +
          'AtRXRjYc8Dv3H0rr9E8YzWeyO8Yz2/Z/4lrh8VJHI0ZyOnpQB7dBdwXsKzW8iuhHUGpDwM15Hpes\n' +
          'XWmTCW2kIH8SH7p/CvQtN8QW+qWoZSEmA+dKALt1KOgqsTgDPWmM2989aGbnFJgeP0hNFKFzTATt\n' +
          'RTiMCk7UAJS5puDmnbTigCzB9yrAbiq0H3TUwpFIRxyM+tb+nHYowawH+7Wvp7/KopxJkdNbtk5x\n' +
          '2r2fwhdC58P25zygKEfSvFbY8CvTPh3dfJcWjNnGGAqZq6NKb1Mv4sW5itorsf8APRSf5f4V54zA\n' +
          'qCD1FeyfEnS2v/Bt20YzJGPM/KvDrKYy249hXNNXR24eVm0OkfBNQu9OmDdRVdiehFZo6GO8ygSV\n' +
          'GaTNXYi5MZBUMj5ppaoXJHemkS2ObBphAFRM5FNLk1SRhKRLkCgvUOSe9Gaozeo8vTMljQqFjVuG\n' +
          '2JFF0hpXKwTmr/h2x+3+ILdCMxIfMb6Dmkkg2JkV0nhTTzaaRd6o4+aT9zF/U04u5ElYy9cnwt3N\n' +
          '2Zti1yqDapre8SsI3itgeg3N9awwPlOK0RlJiEhlx3p0cMjRu4AKp1NQgndU0cjKCASAeozwaokA\n' +
          '4+tPLRmF8r+8/hxSLF5jqqkZY4pJVMMjI33l4NAFcH5sHirlvKqyZkTclVhsZ/m4BpyNjjPSgCRy\n' +
          'Nx+X5T0zUbRK3K8VKNrYDE0+dIoZAIm3qR196AKjRtH2yKRWGeatK4xz0qVbSKaF33hWXse9AFRG\n' +
          'KHI6VoWdw9vKssTkEc4rPaFk5X5h7VJE4A64NAHommX6X1sJARvHDD0q5nJNcJpGoPY3qZ/1chww\n' +
          'ruEYEZHINKwHkwHNOBxTfpShCe1MBxCsM5waZ/KrC24x8xqe3jthJ++B2YoHYzsHNPUMRU0oQM20\n' +
          'fLnihegxQIIAQSDU4qNQQ3OakpFIRulaGnt+6BB56VQq3pp+d1/GmhSOks5SwXJ5rtPCt6dP1e3l\n' +
          'Ynax2t9DXE2agsD0NdLbNiMMDyKbQkz2+eCK7s5YJBujlQqfcEV8z3GmyaPrl5p0o/1UpAz3GeD+\n' +
          'VfQ3hrUV1HR4nJ+dRsYVwPxR0Dy72DWYY8Bv3cpH6GuZrodUJWkmjzyW2JGQOKqSWp64rfjQNGCe\n' +
          'cjio3twD0rmu07HoKzRzUkJXtUDAg4xXQT2wOeKzZrYqTVqRDRmtxURbJq7JDxVUxknArRMxkmQs\n' +
          'M0wg1ZEDntUqW3GSKfNYjkbKOxj2qWOBmIwKtpAWbAFattZKqDjmk5hGmUbayPGRWgloFXpVuKED\n' +
          'tUzbVHvWblcvlsZ32CS7nitYRmSVgg/Gu7vrGOws7exTAhtU59z3P51F4K01JLyXU5RlLcYj/wB4\n' +
          '9/yzTfGt6LPSLhy372YFR+NdFNaHLUlqeT6tdfbdRmm/hLHb9O1U2OFpTy5o8tppAiDJrVGLHW7Q\n' +
          '72EqkjHBHrUWT6cUh+U7T1B5pwbjFMQoyOQeRQQ0z/e+Y+tSzOjxxiNQpVcHHeoBkHNAEbZVselS\n' +
          'IQw5P41GQWYYpwUo5VhgigC3JCbdgrFTkZBU1GSDTc7gATS+W2zfg7fWgCZLWR4HnXBjQ4Y5pAR2\n' +
          'qNWIG3Jweoz1pwjLMAuSTQBPGhkdVT7x4A9ajkgBcq2VcHBHoacu+KQE5V1OfpSSsWcvkknkmgBh\n' +
          '3qdrcehrutCvhfachz86fKwrkbaZFJ8yMSKVKkHitPw9dx2U06sdquoI/A0COcWNUYjrinEj0ppG\n' +
          'DxSlGDYZSPrQMsPbGO2imLAiTOB3GKhc4FKSSAMnA6U1lYrnGR60hldvQU6Lgg+lMfKmlRsDFMRc\n' +
          'uLn7TIr7AuFxxTM0yJTI4QdW6UrZUlT1BwaQx2altJPLuhno1QKTT14mjPvTQnsddYHeVAAOa6FQ\n' +
          'IQqniuU0yQmVeOBW2JzNOPn4BqhI77wbqZsdSFpKcRz9PZq7zVtOi1fSZrKUArKnB9D614+HcIsg\n' +
          '+8vKn0NeseHdVXVNKhm3fvAArj3rGpHqbQdzxR4pbG8nsbgYlgcqQaU4Ndl8S9DaOaLW7ePtsnIH\n' +
          '5GuE83K5B61yVI63R30Z3VmMuMAGs+Tk1auHyDzVAtzmpSNJMjdMg1CIvm6Va3Z60mPmBqrktXES\n' +
          'EEdKZKmOBVoH5ajC7m5NIa2G20QBzitNWVUqrGu0GkdmoYWLBnGeKVVeaRY15ZyAAO5qsiknJrt/\n' +
          'BGkLJO2qXK5hg4iB/if1/CqhG7MqkuVXOlsNPTSdIhsR98DfKf8AaNeT/EHVxdaqbWJsxwcH3bvX\n' +
          'pvibV/7K0ee6ODM+QgP948D/ABrwW9d5JmkdssxyT612JWR57d3crZyCaYsjI4ZSQfWnkhetVzkd\n' +
          'aoke2GJYHrUpheONXONrdMGqwyamVmKhCTt96AFzRMxdtwGB0wKesTGF5VIKrjNRhiHBAzg5oAj5\n' +
          'B9MUDLHPU0+cl5C+MZ7Cog2DQBMKn8xjB5RPy5zTWlD26KECsOpHeo6ADkHk1LFIyOGBwVORS28q\n' +
          'xSZdA64ximMfmJ7Z4oAnlkaZ2kY5ZuTSK+0g9cetRqx7Yqa4dGZCiBRtAOPWgB80wkmMiqEBHQVC\n' +
          '8pUZojYFgG+73qKRgDheaABc7s1JNO8zAsegxxUW7pSkjPFABuOeOtS+ewgMXG080swhWOMx53Ef\n' +
          'NmoC3HNIZC5zQoUR7s/NnpSPjNNHNMRZR2Rg6nDDoaXcSSTySc5qGM9RmrJhdbdZiMKTigaEFDcM\n' +
          'ppAaVuQMUgZv6bKQvrxWxYnLHjOTWDZKUQZ6Gtqxf5h9ashHRs220PHOPWt7wdrI0+9WOV8Qynac\n' +
          '9j2rn2w9mQBUkSqIRjqMHI60mrotOzPZ7y1i1GxltplDxyKQwPevB9b0qbQdXm0+cHCnMbHoynoa\n' +
          '9b8J63/aNl5FwR9pg6843L2NVfHvhr/hINI8+2X/AE+1+ZP9te6muaS6HVGXK7ni8xNVCealaRss\n' +
          'kgKupwwIwQaiPJrG1jo5rhRmlxmkxSKTHbsrgVJGKYEPFTLxQWlcmUcUjAUm+kDM7qiKXdiAqgZJ\n' +
          'NIHZI0NJ06XVdQis4FO5jkn+6O5NeoIkFlax2cGBb264z6nuTWdo2kp4f0zyMhtRnXdcP/dH9wH0\n' +
          '9a5jx14mFjajTLNwZpB+8I6qvp9a6qcLI8+rU5nocz438RNq2pNFE2baI7VA7+9ccx5yeaklmjzw\n' +
          '2WP6VTZiSQT+VanONkf5qaWz0pRGXYBeCSAM064t3tpfLfG7GeKYBIylU2LjA596YCaAasQNBsk8\n' +
          'xSWx8n1oAYpO0jPB6inSRrHGjBwS3UelRgnPNKcd+lAEZORSMQQMDGKklVEC7PTmoTQBKjYqaLyy\n' +
          'rb8g44qFEHlltw+lOBoAN2DxT1YdxTQN7AZGScc0+SIwybGIJHpQBNKsKLG0ZJJ+97UgKsmDUQOa\n' +
          'c6mNVbOVagCSaJYZNqybgBnIqnIcnripidwznpVfG5zmgCxFH5sgUEAn1pRHsdlPJBxTVGOc80uD\n' +
          '1oGOPv0pz2siQLMw+Rjwaj2k5JBH1pXldlCFiVHQUgK0nXApgp0nQ0wHHWmIlDZfpU5lcxiMsSo5\n' +
          'xVUHvUw5oGiQc05gMD60xTTiflpAbMLYRFA7Vp2LHeOe9Y4b92pz0ArR0+YNcL7mqRKOuRmFsQBk\n' +
          'Yp9udqjNQByIto78U4Y8kYbBpjNTTtQfTLtL1FJMZ+Zc9Vr07TtUg1KzS7tn3I4/L2NeSW7GUlW6\n' +
          'EVo6Zqsvhy+CjL2kv3lP86zlG5rGVi14+8Em6Mms6THmbrPCv8XuPevLVc9GyCDgg19DW96k0SzQ\n' +
          'SB42Gcg1yHibwJZa073unstpeMcsMfI59/SsWk9DZSseW59DS5q5qPhzWdIci5s5Cg/5aRjcpqha\n' +
          'QXN7dJa28Eks7nCxqOTWbgzVVESB8U/fxmmJY38l21qlnO06ttKBDkGuq034d63dYe78qxh7vK3I\n' +
          'H0pchftEjm4xJNMkMSM8shwqKOSa9E0bQYvDaJcXSLPq7rlI+qwe596uWFhpXh1fK0mH7VfH5Wu5\n' +
          'BnH+76Vjaz4hXTi0Ns4udSk5ZjyIz7/4VtCnbU56ta+iJ9d19NGt3BcSX8oLbTzt9z7V43qeoPc3\n' +
          'UsrOWdydzZ6mtbxJcvG6o0jSTy/vJJGPJJrlZDyK2sczZImHkwScUh4Jx0FInSpY2QSKZBlQeR60\n' +
          'ySNTzmnMxkOWYk+tLcFTKxjXCE8CoxQBKtu5gMvG0cdaZuxwKUMdu3ccelPit3mfZEAWxnmgBYnU\n' +
          'Mdy5ypA9jUeGOSc8daM7Tj0p6SsI3jH3X60AMbGMUzaNu7PPpTih5bHGcE0w+lACqRnHrUgjZzhB\n' +
          'mocc8VPC7RtuU4NACAFTz2p5bf35qNt2c9fWhTnpQBIAcdDj1pZc7QfSneaxhERxtBzUbgsAg60A\n' +
          'NY7U69aSAEk/SmSElgPSprUZY/SgBe+akhYrMr4Bxzg1Eegp/wDdFAx88pllL4C57CoSeKe3U1G1\n' +
          'IVyNyMVG2MjFPbpUZOOPemA8NgYFSo/UVCKevUUATCndj60xT/On9aBl+N8WyHrWppibp1FY9vg2\n' +
          '/OeDWrpbEXa4NMhnWxB/urzx608gAHJ/CqgkJIA44oMjDA49KBmlbzBcD1NaF2sc0YUjIxWLbAkB\n' +
          'mOdp4rQlclMLyfT+tIvoO03VLjQ7naSWtW698V2UF/BeQrNC/BHUHNcYEGw5GSRyDVY28kfzWczw\n' +
          'v1wp4NTKCew4zZ6CJ59uAwce/NLA8yzK8UMMcgPDBADXnsGs6vZSDzh5q5xzW5a+LY8bZVnik9AC\n' +
          'QfpUODQ+ZHWS3d15hKpGjHq4AyTWRf30SRs93dhsdRnP6Vk3urXF7BsthJErfekl6j6CuY1COOBv\n' +
          'LSVpZm4JJpqA3Kxa1HxBc3jNBYf6Pb9C38Tf4Vn29koIODnPOTUlvbkBfUdeKkupfs9nNMB91Sf0\n' +
          'q7WITuefeIJjLrM57Kdo/CspvfrU8shmleRuSSTUON7UxMciMcADJPQU8qUYqwIYdQaFJR1KnBHO\n' +
          'adKxlcuxyx5JoER7snmpJ3EgG1duP1pkiGMgEg5GaaPagBATmpEZkO9WIOMcVLbtAFk85Cxx8nsa\n' +
          'gJIoAcEDMecYGajDU8UqhCGLEgjp70AG4mMrnioyD25ozTgxAOD1oAjBIpwPFNI5qSEr5i+YPl74\n' +
          'oAAxyOKfIwONo+tMcqHbb93PFIGxQBIGFMdirEg1LGsbRs5bDDoKqyNlyBQAikk5qzbMFJJqsvSp\n' +
          'kwqZ9TQBIe1P/iWiigGB6mo2oopCIm6Com60UUxjxT1+8KKKAJF/rUgoooGWoP8Aj3/GtbS/+Pof\n' +
          'SiimQdFH98UN98UUUDLtt/q/xq4P9Y3+7RRSKew9vu0yL+tFFC3Etgk/1h/3v6VPaqpkjJUE+uKK\n' +
          'KpjReuQBCMDHJrkm5v2zzzRRUjZdXoKp6wf+JLdf7h/lRRSGtjzbsabH1NFFBLHN9+m96KKYgk5/\n' +
          'KmDpRRQBJT4wDKgIyM0UUANnGJm+ppi9KKKAF/vUw0UUAKv36RuGOPWiigBzdBSUUUAPHVagk/1h\n' +
          'oooAD2qT+AUUUAf/2Q==',
      expiryDate: '2024-11-03T00:00:00.000Z',
      issuedDate: '2019-11-04T00:00:00.000Z',
      issuedAt: 'osogbo',
      referenceId: 'A11000000',
      passportNumber: user_data
    }
  };
  return data;
};

export const zeehVerifyBvnTestResponse = (user, bvn) => {
  const data = {
    status: 'success',
    code: 0,
    data: {
      bvn: bvn,
      first_name: user.first_name,
      last_name: user.last_name,
      middle_name: user.middle_name !== null ? user.middle_name : '',
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      phone_number1: user.phone_number,
      photo: '/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a\n' +
        'HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy\n' +
        'MjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAHSAV4DASIA\n' +
        'AhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQA\n' +
        'AAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3\n' +
        'ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWm\n' +
        'p6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEA\n' +
        'AwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSEx\n' +
        'BhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElK\n' +
        'U1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3\n' +
        'uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDozwKC\n' +
        'OBTSacDximA3GaMCncUg60wGEUoFKaBQA3NLmgjNGKAFpQab3ozQBIDSg81FmlyaAJM0vQVHmnbq\n' +
        'BDhS1GGNPB4oAM80tIDSZoAfmnBhUWaKAJd/tQHFR5xRmgCTfSbzTAaWgBS5oLU00gyDTAdR2pKK\n' +
        'AF7UhFLkUmaAEFKQKKQkU7iF6Um4UwtzSH1pAS5FJnPSo+TTlGKAHU4dKaKUdKAFNKDzzSUd6AHk\n' +
        '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\n' +
        'oooAD2qT+AUUUAf/2Q==',
      email: user.email,
      enrollment_bank: '033',
      enrollment_branch: 'Badagry',
      level_of_account: 'Level 1 - Low Level Accounts',
      lga_of_origin: 'Katsina-Ala',
      lga_of_residence: 'Badagry',
      marital_status: 'Married',
      name_on_card: '242 c compound badagry',
      nationality: 'Nigeria',
      nin: '',
      phone_number2: '',
      registration_date: '',
      residential_address: '242 c compound badaGRY ',
      state_of_origin: 'Benue State',
      state_of_residence: 'Lagos State',
      title: 'Mrs',
      watch_listed: '',
      customer: '38e0e1c0-2318-4292-8180-b35345f6dd99'
    }
  };
  return data;
};

export const paystackResolveAccountNumberTestResponse = (account_number, user) => {
  const data = {
    status: true,
    message: 'Account number resolved',
    data: {
      'account_number': account_number,
      'account_name': `${ user.first_name.toUpperCase() } ${ user.middle_name.toUpperCase() } ${ user.last_name.toUpperCase() }`,
      // This will only pass for users with middle name and won't pass for users without middle name
      'bank_id': 9
    }
  };
  return data;
};

export const paystackInitializeCardPaymentTestResponse = (reference) => {
  const data = {
    status: true,
    message: 'Authorization URL created',
    'data': {
      'authorization_url': 'https://checkout.paystack.com/cw0o99ro6d1nkss',
      'access_code': 'cw0o99ro6d1nkss',
      'reference': reference
    }
  };
  return data;
};

export const paystackFetchBankListsTestResponse = () => {
  const data = {
    status: true,
    message: 'Banks retrieved',
    data: [
      {
        'id': 302,
        'name': '9mobile 9Payment Service Bank',
        'slug': '9mobile-9payment-service-bank-ng',
        'code': '120001',
        'longcode': '120001',
        'gateway': '',
        'pay_with_bank': false,
        'active': true,
        'country': 'Nigeria',
        'currency': 'NGN',
        'type': 'nuban',
        'is_deleted': false,
        'createdAt': '2022-05-31T06:50:27.000Z',
        'updatedAt': '2022-06-23T09:33:55.000Z'
      },
      {
        'id': 174,
        'name': 'Abbey Mortgage Bank',
        'slug': 'abbey-mortgage-bank',
        'code': '801',
        'longcode': '',
        'gateway': null,
        'pay_with_bank': false,
        'active': true,
        'country': 'Nigeria',
        'currency': 'NGN',
        'type': 'nuban',
        'is_deleted': false,
        'createdAt': '2020-12-07T16:19:09.000Z',
        'updatedAt': '2020-12-07T16:19:19.000Z'
      },
      {
        'id': 188,
        'name': 'Above Only MFB',
        'slug': 'above-only-mfb',
        'code': '51204',
        'longcode': '',
        'gateway': null,
        'pay_with_bank': false,
        'active': true,
        'country': 'Nigeria',
        'currency': 'NGN',
        'type': 'nuban',
        'is_deleted': false,
        'createdAt': '2021-10-13T20:35:17.000Z',
        'updatedAt': '2021-10-13T20:35:17.000Z'
      }
    ]
  };
  return data;
};

export const paystackVerifyTransactionStatusTestResponse = (reference) => {
  const result = {
    status: true,
    message: 'Verification successful',
    data: {
      id: 2464131595,
      domain: 'test',
      status: 'success',
      reference: reference,
      amount: 50000,
      message: null,
      gateway_response: 'Successful',
      paid_at: '2023-01-21T00:35:45.000Z',
      created_at: '2023-01-21T00:35:31.000Z',
      channel: 'card',
      currency: 'NGN',
      ip_address: '102.89.46.48',
      metadata: '',
      log: {
        start_time: 1674261342,
        time_spent: 2,
        attempts: 1,
        errors: 0,
        success: false,
        mobile: false,
        input: [],
        history: [Array]
      },
      fees: 750,
      fees_split: null,
      authorization: {
        authorization_code: 'AUTH_dsau7cwp5x',
        bin: '408408',
        last4: '4081',
        exp_month: '12',
        exp_year: '2030',
        channel: 'card',
        card_type: 'visa ',
        bank: 'TEST BANK',
        country_code: 'NG',
        brand: 'visa',
        reusable: true,
        signature: 'SIG_LeKgBEBPtDuxJDRKCSsP',
        account_name: null
      },
      customer: {
        id: 109405397,
        first_name: null,
        last_name: null,
        email: 'victory@enyata.com',
        customer_code: 'CUS_0wfczyq7aoqxz4v',
        phone: null,
        metadata: null,
        risk_action: 'default',
        international_format_phone: null
      },
      plan: null,
      split: {},
      order_id: null,
      paidAt: '2023-01-21T00:35:45.000Z',
      createdAt: '2023-01-21T00:35:31.000Z',
      requested_amount: 50000,
      pos_transaction_data: null,
      source: null,
      fees_breakdown: null,
      transaction_date: '2023-01-21T00:35:31.000Z',
      plan_object: {},
      subaccount: {}
    }
  };
  return result;
};

export const paystackInitiateRefundTestResponse = (transaction_id) => {
  const result = {
    status: true,
    message: 'Refund has been queued for processing',
    data: {
      transaction: {
        id: transaction_id,
        domain: 'test',
        reference: '013d96fb-49ec-40f7-bf35-5a91b4f5ea87',
        amount: 50000,
        paid_at: '2023-01-21T01:00:48.000Z',
        channel: 'card',
        currency: 'NGN',
        authorization: [Object],
        customer: [Object],
        plan: {},
        subaccount: [Object],
        split: {},
        order_id: null,
        paidAt: '2023-01-21T01:00:48.000Z',
        pos_transaction_data: null,
        source: null,
        fees_breakdown: null
      },
      integration: 894264,
      deducted_amount: 0,
      channel: null,
      merchant_note: 'Refund for transaction 013d96fb-49ec-40f7-bf35-5a91b4f5ea87 by admin@tdlc.ng',
      customer_note: 'Refund for transaction 013d96fb-49ec-40f7-bf35-5a91b4f5ea87',
      status: 'pending',
      refunded_by: 'admin@tdlc.ng',
      expected_at: '2023-01-31T01:00:51.740Z',
      currency: 'NGN',
      domain: 'test',
      amount: 50000,
      fully_deducted: false,
      id: 7934510,
      createdAt: '2023-01-21T01:00:52.948Z',
      updatedAt: '2023-01-21T01:00:52.948Z'
    }
  };
  return result;
};

export const seedfiUnderwritingApprovedLoanApplicationTestResponse2 = (payload) => {
  const data = {
    status: 200,
    statusText: 'OK',
    data: {
      loan_application_id: payload.loan_application_id,
      loan_duration_in_month: payload.loan_duration_in_month,
      loan_amount: payload.loan_amount,
      orr_score: 81.99,
      final_decision: 'APPROVED',
      pricing_band: 36,
      monthly_interest: 0.03,
      fees: {
        processing_fee: parseFloat(0.01 * parseFloat(payload.loan_amount)),
        insurance_fee: parseFloat(0.01 * parseFloat(payload.loan_amount)),
        advisory_fee: parseFloat(0.01 * parseFloat(payload.loan_amount)),
        processing_fee_percentage: 0.01,
        insurance_fee_percentage: 0.01,
        advisory_fee_percentage: 0.01
      },
      monthly_repayment: (payload.loan_amount/parseFloat(payload.loan_duration_in_month)).toFixed(2),
      max_approval: parseFloat(payload.loan_amount)
    }
  };

  return data;
};
export const seedfiUnderwritingApprovedLoanApplicationTestResponse = (payload) => {
  const data = {
    status: 200,
    statusText: 'OK',
    data: {
      loan_application_id: payload.loan_application_id,
      loan_duration_in_month: payload.loan_duration_in_month,
      loan_amount: payload.loan_amount,
      orr_score: 81.99,
      final_decision: 'APPROVED',
      pricing_band: 36,
      monthly_interest: 0.03,
      fees: {
        processing_fee: parseFloat(0.01 * parseFloat(payload.loan_amount)),
        insurance_fee: parseFloat(0.01 * parseFloat(payload.loan_amount)),
        advisory_fee: parseFloat(0.01 * parseFloat(payload.loan_amount)),
        processing_fee_percentage: 0.01,
        insurance_fee_percentage: 0.01,
        advisory_fee_percentage: 0.01
      },
      monthly_repayment: parseFloat(parseFloat((((0.03) * parseFloat(payload.loan_amount)) / (1 - ((1 + (0.03)) ** (-Number(payload.loan_duration_in_month)))))).toFixed(2)),
      max_approval: parseFloat(parseFloat(payload.loan_amount) - parseFloat(payload.loan_amount * 0.25))
    }
  };
  return data;
};

export const seedfiUnderwritingLoanRenegotiationTestResponse = (body, existingLoanApplication) => {
  const data = {
    status: 200,
    statusText: 'OK',
    data: {
      loan_application_id: existingLoanApplication.member_loan_id ? existingLoanApplication.member_loan_id : existingLoanApplication.loan_id,
      pricing_band: 45,
      monthly_interest: 0.04,
      monthly_repayment: parseFloat(parseFloat((((0.04) * parseFloat(body.new_loan_amount)) / (1 - ((1 + (0.04)) ** (-Number(body.new_loan_duration_in_month)))))).toFixed(2)),
      fees: {
        processing_fee: parseFloat(0.01 * parseFloat(body.new_loan_amount)),
        insurance_fee: parseFloat(0.01 * parseFloat(body.new_loan_amount)),
        advisory_fee: parseFloat(0.01 * parseFloat(body.new_loan_amount)),
        processing_fee_percentage: 0.01,
        insurance_fee_percentage: 0.01,
        advisory_fee_percentage: 0.01
      },
      previous_loan_application_response: {
        fees: {
          advisory_fee: parseFloat(0.01 * parseFloat(existingLoanApplication.amount_requested)),
          insurance_fee: parseFloat(0.01 * parseFloat(existingLoanApplication.amount_requested)),
          processing_fee: parseFloat(0.01 * parseFloat(existingLoanApplication.amount_requested)),
          advisory_fee_percentage: 0.01,
          insurance_fee_percentage: 0.01,
          processing_fee_percentage: 0.01
        },
        orr_score: parseFloat(existingLoanApplication.percentage_orr_score),
        loan_amount: parseFloat(existingLoanApplication.amount_requested),
        max_approval: parseFloat(existingLoanApplication.max_possible_approval),
        pricing_band: 45,
        final_decision: 'MANUAL',
        monthly_interest: 0.04,
        monthly_repayment: parseFloat(parseFloat((((0.04) * parseFloat(existingLoanApplication.amount_requested)) /
          (1 - ((1 + (0.04)) ** (-Number(existingLoanApplication.initial_loan_tenor_in_months)))))).toFixed(2)),
        loan_application_id: existingLoanApplication.member_loan_id ? existingLoanApplication.member_loan_id : existingLoanApplication.loan_id,
        loan_duration_in_month: parseFloat(existingLoanApplication.initial_loan_tenor_in_months)
      }
    }
  };
  return data;
};

export const seedfiMonoAccountIdGenerationTestResponse = () => {
  const data = {
    id: '646c85c6e7c746906dbb4ac4'
  };
  return data;
};

export const seedfiYouVerifyUserCandidateCreationTestResponse = (user) => {
  const data = {
    success: true,
    statusCode: 201,
    message: 'Candidate created successfully!',
    data: {
      firstName: user.first_name,
      middleName: '',
      lastName: user.last_name,
      dateOfBirth: user.date_of_birth,
      photo: user.image_url,
      email: user.email,
      mobile: user.phone_number.replace('+234', '0'),
      idNumber: null,
      type: 'form',
      medium: 'form',
      youverifyCandidateId: '644988355df07530ef289564',
      businessId: '642e9966bfa9c5d130d62571',
      createdAt: '2023-04-26T20:23:17.638Z',
      lastModifiedAt: '2023-04-26T20:23:17.638Z',
      _createdAt: '2023-04-26T20:23:1717+00:00',
      _lastModifiedAt: '2023-04-26T20:23:1717+00:00',
      id: generateReferralCode(12)
    },
    links: []
  };
  return data;
};

export const seedfiYouVerifyUserAddressVerificationRequestTestResponse = (user, body, requestId, candidateId) => {
  const data = {
    success: true,
    statusCode: 201,
    message: 'Address requested successfully!',
    data: {
      candidate: {
        candidateId: candidateId,
        firstName: user.first_name,
        middleName: '',
        lastName: user.first_name,
        photo: user.image_url,
        email: null,
        mobile: user.phone_number.replace('+234', '0')
      },
      agent: {
        firstName: null,
        middleName: null,
        lastName: null,
        signature: null,
        photo: null
      },
      address: {
        latlong: [Object],
        flatNumber: '',
        buildingName: '',
        buildingNumber: body.house_number,
        subStreet: '',
        street: body.street,
        landmark: body.landmark,
        state: body.state,
        city: body.city,
        country: 'nigeria',
        lga: body.lga
      },
      referenceId: '6449b9e75df07589e8289597',
      parentId: null,
      status: 'pending',
      taskStatus: 'PENDING',
      tatStatus: 'NOT_AVAILABLE',
      subjectConsent: 'true',
      notes: [],
      isFlagged: false,
      description: 'Verify the candidate',
      reportId: '6449b9e75df07589e8289597',
      downloadUrl: null,
      apiVersion: 'v2',
      businessType: 'business',
      businessId: '642e9966bfa9c5d130d62571',
      userId: '642e9966bfa9c50707d6256d',
      type: 'individual',
      metadata: {requestId},
      createdAt: '2023-04-26T23:55:19.272Z',
      lastModifiedAt: '2023-04-26T23:55:19.272Z',
      _createdAt: '2023-04-26T23:55:1919+00:00',
      _lastModifiedAt: '2023-04-26T23:55:1919+00:00',
      verificationId: '6449b9e75df07589e8289597',
      id: generateReferralCode(12)
    },
    links: []
  };
  return data;
};

export const seedfiUnderwritingUserAndLoanApplicationOrrBreakdownTestResponse = (user_id, loan_id) => {
  const result = {
    status: 200,
    data: {
      customer_id: user_id,
      loan_id: loan_id,
      breakdown: {
        orr_score: 81.25,
        date_of_birth_actual_score: 5.0,
        marital_status_actual_score: 2.5,
        monthly_income_actual_score: 3.5,
        employment_type_actual_score: 10.0,
        number_of_dependants_actual_actual: 1.75,
        number_of_returned_cheques_actual_score: 5.0,
        history_of_court_case_from_cr_actual_score: 5.0,
        total_length_of_credit_history_actual_score: 9.0,
        total_number_of_active_loans_availed_actual_score: 7.5,
        total_number_of_closed_loans_availed_actual_score: 12.0,
        history_of_written_off_account_from_cr_actual_score: 5.0,
        total_number_of_returned_cheques_from_cr_report_actual_score: 15.0
      },
      decision_reasons: [
        {
          id: 1,
          upper_limit: 74.99,
          lower_limit: 65.0,
          reason: 'MANUAL'
        },
        {
          id: 2,
          upper_limit: 100.0,
          lower_limit: 75.0,
          reason: 'APPROVED'
        }
      ]
    }
  };
  return result;
};

export const paystackPlatformBalanceCheckerTestResponse = () => {
  const result = {
    status: true,
    message: 'Balances retrieved',
    data: [{currency: 'NGN', balance: 10000000000}]
  };
  return result;
};

export const paystackUserRecipientCodeCreationTestResponse = (userDisbursementAccountDetails) => {
  const result = {
    status: true,
    message: 'Transfer recipient created successfully',
    data: {
      active: true,
      createdAt: '2023-02-23T14:56:37.020Z',
      currency: 'NGN',
      domain: 'test',
      id: 48946220,
      integration: 894264,
      name: userDisbursementAccountDetails.account_name,
      recipient_code: 'RCP_lwdid9q9ebzg20oldismmd39',
      type: 'nuban',
      updatedAt: '2023-02-23T14:56:37.020Z',
      is_deleted: false,
      isDeleted: false,
      details: {
        authorization_code: null,
        account_number: userDisbursementAccountDetails.account_number,
        account_name: userDisbursementAccountDetails.account_name.toUpperCase(),
        bank_code: userDisbursementAccountDetails.bank_code,
        bank_name: userDisbursementAccountDetails.bank_name
      }
    }
  };
  return result;
};

export const initiatePaystackBankTransferTestResponse = (userTransferRecipient, existingLoanApplication, reference) => {
  const result = {
    status: true,
    message: 'Transfer has been queued',
    data: {
      transfersessionid: [],
      domain: 'test',
      amount: parseFloat(existingLoanApplication.amount_requested) * 100,
      currency: 'NGN',
      reference: reference,
      source: 'balance',
      source_details: null,
      reason: 'Loan facility disbursement',
      status: 'success',
      failures: null,
      transfer_code: userTransferRecipient,
      titan_code: null,
      transferred_at: null,
      id: 249017035,
      integration: 894264,
      request: 224392831,
      recipient: 48945403,
      createdAt: '2023-02-23T16:33:42.000Z',
      updatedAt: '2023-02-23T16:33:42.000Z'
    }

  };
  return result;
};

export const initiateChargeViaCardAuthTokenPaystackTestResponse = (reference) => {
  const result = {
    status: true,
    message: 'Charge attempted',
    data: {
      id: 2590405333,
      domain: 'test',
      status: 'success',
      reference: reference,
      amount: 21921220,
      message: null,
      gateway_response: 'Successful',
      paid_at: '2023-03-03T22:38:26.000Z',
      created_at: '2023-03-03T22:38:26.000Z',
      channel: 'card',
      currency: 'NGN',
      ip_address: '172.31.68.32',
      metadata: '',
      log: null,
      fees: 200000,
      fees_split: null,
      authorization: {
        authorization_code: 'AUTH_opcf85n7x5',
        bin: '408408',
        last4: '4081',
        exp_month: '12',
        exp_year: '2030',
        channel: 'card',
        card_type: 'visa ',
        bank: 'TEST BANK',
        country_code: 'NG',
        brand: 'visa',
        reusable: true,
        signature: 'SIG_LeKgBEBPtDuxJDRKCSsP',
        account_name: null
      },
      customer: {
        id: 114027951,
        first_name: null,
        last_name: null,
        email: 'akinpelumi@enyata.com',
        customer_code: 'CUS_hq6flu6mv1wy2e1',
        phone: null,
        metadata: null,
        risk_action: 'default',
        international_format_phone: null
      },
      plan: null,
      split: {},
      order_id: null,
      paidAt: '2023-03-03T22:38:26.000Z',
      createdAt: '2023-03-03T22:38:26.000Z',
      requested_amount: 21921220,
      pos_transaction_data: null,
      source: null,
      fees_breakdown: null,
      transaction_date: '2023-03-03T22:38:26.000Z',
      plan_object: {},
      subaccount: {}
    }
  };
  return result;
};

export const initiateChargeViaBankAccountPaystackTestResponse = (reference) => {
  const result = {
    status: true,
    message: 'Charge attempted',
    data: {
      reference: reference,
      status: 'send_otp',
      display_text: 'To confirm that you own this account, kindly enter the OTP sent to your phone'
    }
  };
  return result;
};

export const paystackSubmitOtpTestResponse = (reference) => {
  const data = {
    status: true,
    message: 'Charge attempted',
    data: {
      id: 2598623413,
      domain: 'test',
      status: 'success',
      reference: reference,
      amount: 18921220,
      message: 'madePayment',
      gateway_response: 'Approved',
      paid_at: '2023-03-06T12:01:55.000Z',
      created_at: '2023-03-06T11:43:09.000Z',
      channel: 'bank',
      currency: 'NGN',
      ip_address: '172.31.68.216',
      metadata: '',
      log: null,
      fees: 200000,
      fees_split: null,
      authorization: {
        authorization_code: 'AUTH_59uaygpua0',
        bin: '000XXX',
        last4: 'X000',
        exp_month: '12',
        exp_year: '9999',
        channel: 'bank',
        card_type: '',
        bank: 'Zenith Bank',
        country_code: 'NG',
        brand: 'Zenith Emandate',
        reusable: false,
        signature: null,
        account_name: null
      },
      customer: {
        id: 114027951,
        first_name: null,
        last_name: null,
        email: 'akinpelumi@enyata.com',
        customer_code: 'CUS_hq6flu6mv1wy2e1',
        phone: null,
        metadata: null,
        risk_action: 'default',
        international_format_phone: null
      },
      plan: null,
      split: {},
      order_id: null,
      paidAt: '2023-03-06T12:01:55.000Z',
      createdAt: '2023-03-06T11:43:09.000Z',
      requested_amount: 18921220,
      pos_transaction_data: null,
      source: null,
      fees_breakdown: null,
      transaction_date: '2023-03-06T11:43:09.000Z',
      plan_object: {},
      subaccount: {}
    }
  };
  return data;
};

export const seedfiUnderwritingLoanScoreCardBreakdown = () => {
  const result = {
    status: 200,
    data: {
      monthly_income_weight: 5.0,
      employment_type_weight: 10.0,
      marital_status_weight: 2.5,
      dependant_weight: 2.5,
      monthly_income_returned_cheque_weight: 5.0,
      returned_cheques_from_cr_weight: 15.0,
      date_of_birth_weight: 5.0,
      length_of_cr_history_weight: 15.0,
      closed_loan_availed_weight: 15.0,
      active_loan_availed_weight: 15.0,
      court_case_history_weight: 5.0,
      history_of_written_account_unpaid: 0.0
    }
  };
  return result;
};

