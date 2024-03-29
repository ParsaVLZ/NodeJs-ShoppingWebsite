const createHttpError = require("http-errors");
const { getOtpSchema, checkOtpSchema } = require("../../../validators/user/auth.schema");
const { RandomNumberGenerator, SignAccessToken, VerifyRefreshToken, SignRefreshToken } = require("../../../../utils/functions");
const { UserModel } = require("../../../../models/users");
const { ROLES } = require("../../../../utils/constants");
const Controller = require("../../controller");

class UserAuthController extends Controller{
    async getOtp(req, res, next){
        try {
            await getOtpSchema.validateAsync(req.body);
            const {mobile} = req.body;
            const code = RandomNumberGenerator();
            const result = await  this.saveUser(mobile, code);
            if(!result) throw createHttpError.Unauthorized("ورود شما انجام نشد")
            return res.status(200).send({
                data:{
                    statusCode : 200,
                    message: "کد اعتبارسنجی با موفقیت برای شما ارسال شد",
                    code,
                    mobile
                }
            });
        } catch (error) {
            next(error);
        }
    }
    async checkOtp(req, res, next){
        try {
            const { refreshToken } = req.body;
            const mobile = await VerifyRefreshToken(refreshToken);
            const user = await UserModel.findOne({ mobile })
            const accessToken = await SignAccessToken(user._id);
            const newRefreshToken = await SignRefreshToken(user._id);
            return res.status(HttpStatus.OK).json({
              StatusCode: HttpStatus.OK,
              data: {
                accessToken,
                refreshToken: newRefreshToken,
                user
              }
            })
          } catch (error) {
            next(error)
          }
        }
    async refreshToken(req, res, next){
        try {
            const { refreshToken } = req.body;
            const mobile = await VerifyRefreshToken(refreshToken);
            const user = await UserModel.findOne({mobile});
            const accessToken = await SignAccessToken(user._id);
            const newRefreshToken = await SignRefreshToken(user._id);
            return res.json({
                data:{
                    accessToken,
                    refreshToken : newRefreshToken
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async saveUser(mobile, code){
        let otp = {
            code,
            expiresIn : (new Date().getTime() + 120000)
        }
        const result = await this.checkExistUser(mobile);
        if(result){
            return (await this.updateUser(mobile, {otp}))
        }
        return !!(await UserModel.create({
            mobile,
            otp,
            Roles : [ROLES.USER]
        }))
    }
    async checkExistUser(mobile){
        const user = await UserModel.findOne({mobile});
        return !!user
    }
    async updateUser(mobile, objectData = {}){
        Object.keys(objectData).forEach(key =>{
            if(["", " ", 0, null, undefined, "0", NaN].includes(objectData[key])) delete objectData[key]
        })
        const updateResult = await UserModel.updateOne({mobile}, {$set : objectData});
        return !!updateResult.modifiedCount
    }
}

module.exports = {
    UserAuthController: new UserAuthController()
}