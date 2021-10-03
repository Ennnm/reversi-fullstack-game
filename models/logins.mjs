export default function loginsModel(sequelize, DataTypes) {
  return sequelize.define('login', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    userId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      defaultValue: Date.now() + (30 * 60 * 1000),
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: Date.now(),
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: Date.now(),

    },
  }, { underscored: true });
}
