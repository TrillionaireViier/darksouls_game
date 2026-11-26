using System;
using UnityEngine;

namespace DarkSouls
{
    public enum SacredCovenant
    {
        None,
        WarriorsOfSunlight,
        Darkwraiths,
        ForestHunters,
        BladeOfTheDarkmoon,
        GravelordServant,
        ChaosServant,
        WayOfWhite,
        PrincessGuard,
        PathOfTheDragon,
        MoundMakers,
        AldritchFaithful,
        VolcanoManorRecusants
    }

    public enum SacredOrder
    {
        OrderOfAsh,
        OrderOfSunlight,
        OrderOfTheAbyss,
        OrderOfTheMoon,
        OrderOfCinder
    }

    public enum SacredVow
    {
        VowOfFire,
        VowOfBlood,
        VowOfStars,
        VowOfShadow,
        VowOfEternity
    }

    /// <summary>
    /// 300 Sacred Covenant Oaths (12 Covenants x 5 Orders x 5 Vows) with Rank progression (Build V78).
    /// </summary>
    public class CovenantSystem : MonoBehaviour
    {
        public SacredCovenant ActiveCovenant { get; private set; } = SacredCovenant.WarriorsOfSunlight;
        public SacredOrder ActiveOrder { get; private set; } = SacredOrder.OrderOfSunlight;
        public SacredVow ActiveVow { get; private set; } = SacredVow.VowOfFire;
        public int CovenantRank { get; private set; } = 1;

        public event Action<SacredCovenant, int> OnCovenantChanged;

        public void JoinCovenant(SacredCovenant covenant)
        {
            ActiveCovenant = covenant;
            CovenantRank = Mathf.Max(1, CovenantRank);
            OnCovenantChanged?.Invoke(ActiveCovenant, CovenantRank);
        }

        public void CycleNextCovenant()
        {
            int count = Enum.GetValues(typeof(SacredCovenant)).Length;
            int next = ((int)ActiveCovenant + 1) % count;
            if (next == 0)
            {
                next = 1;
                int nextOrder = ((int)ActiveOrder + 1) % 5;
                ActiveOrder = (SacredOrder)nextOrder;
                if (nextOrder == 0) ActiveVow = (SacredVow)(((int)ActiveVow + 1) % 5);
            }
            JoinCovenant((SacredCovenant)next);
        }

        public void RankUp()
        {
            CovenantRank = Mathf.Min(3, CovenantRank + 1);
            OnCovenantChanged?.Invoke(ActiveCovenant, CovenantRank);
        }

        public float GetAttackBonusMultiplier()
        {
            float rankScale = 1f + (CovenantRank - 1) * 0.05f;
            float baseMult = ActiveCovenant switch
            {
                SacredCovenant.WarriorsOfSunlight => 1.15f,
                SacredCovenant.Darkwraiths => 1.20f,
                SacredCovenant.ChaosServant => 1.14f,
                SacredCovenant.PathOfTheDragon => 1.22f,
                SacredCovenant.MoundMakers => 1.18f,
                SacredCovenant.VolcanoManorRecusants => 1.24f,
                _ => 1.0f
            };
            return baseMult * rankScale;
        }

        public float GetDefenseBonusMultiplier()
        {
            return ActiveCovenant switch
            {
                SacredCovenant.ForestHunters => 0.88f,
                SacredCovenant.BladeOfTheDarkmoon => 0.86f,
                SacredCovenant.GravelordServant => 0.85f,
                SacredCovenant.WayOfWhite => 0.84f,
                SacredCovenant.PrincessGuard => 0.82f,
                SacredCovenant.AldritchFaithful => 0.87f,
                _ => 1.0f
            };
        }

        public float GetSoulGainMultiplier() => ActiveCovenant switch
        {
            SacredCovenant.Darkwraiths => 1.25f,
            SacredCovenant.AldritchFaithful => 1.30f,
            SacredCovenant.VolcanoManorRecusants => 1.35f,
            _ => 1.0f
        };
    }
}
