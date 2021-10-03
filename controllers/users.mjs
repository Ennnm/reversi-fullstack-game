import pkg from 'sequelize';
import { getHash, checkError } from '../src/util.mjs';

const { Op } = pkg;

export default function initUserController(db) {
  const updateLoginToken = async (userId) => {
    const loginToken = await db.LoginToken.findOne({ where: { userId } });
    const currentDate = new Date();
    loginToken.expiresAt = new Date(currentDate.getTime() + 30 * 60 * 1000);
    loginToken.updatedAt = currentDate;
    await loginToken.save();
  };
  const create = async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const findEmail = await db.User.findOne(
        { where: { email } },
      );
      console.log('findEmail :>> ', findEmail);
      if (findEmail !== null)
      {
        throw Error('Email has been registered before');
      }
      else {
        const userSqx = await db.User.create(
          {
            username,
            email,
            password: getHash(password),
          },
        );
        const userId = userSqx.id;
        await db.LoginToken.create({
          userId,
        });

        res.cookie('loggedIn', getHash(userId));
        res.cookie('userId', userId);
        res.send({ userId });
      }
    } catch (error) {
      console.log('error in user register controller');
      checkError(error);
      res.status(500).send({ error });
    }
  };

  const login = async (req, res) => {
    const user = req.body;
    try {
      const foundUser = await db.User.findOne({
        where: {
          email: user.email,
          password: getHash(user.password),
        },
      });
      if (foundUser !== null) {
        const userId = foundUser.id;
        await updateLoginToken(userId);

        res.cookie('loggedIn', getHash(userId));
        res.cookie('userId', userId);
        res.send({ userId });
      }
      else {
        throw Error('wrong email or password');
      }
    } catch (error) {
      console.log('error in login controller');
      checkError(error);
      res.status(500).send({ error });
    }
  };

  const findMatch = async (req, res) => {
    const currentPlayer = req.cookies.userId;
    const currentTime = new Date();
    const loggedInUsers = await db.LoginToken.findAll({
      where: {
        expires_at: {
          [Op.gte]: currentTime,
        },
        user_id: {
          [Op.ne]: currentPlayer,
        },
      },
    });

    // console.log('loggedInUsers :>> ', loggedInUsers);
    let matchUser;
    let isOfflineMatch = true;
    if (loggedInUsers.length === 0) {
      const allUsers = await db.User.findAll({
        where: {
          id: {
            [Op.ne]: currentPlayer,
          },
        },
      });
      matchUser = allUsers[Math.floor(allUsers.length * Math.random())];
    }
    else
    {
      console.log('matched with logged in player');
      matchUser = loggedInUsers[Math.floor(loggedInUsers.length * Math.random())];
      isOfflineMatch = false;
    }
    console.log('matchUser :>> ', matchUser);
    res.send({ id: matchUser.id, isOfflineMatch });
  };
  return {
    create,
    login,
    findMatch,
  };
}
