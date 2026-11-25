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
        ChaosServant
    }

    public class CovenantSystem : MonoBehaviour
    {
        public SacredCovenant ActiveCovenant { get; private set; } = SacredCovenant.None;
        public int CovenantRank { get; private set; } = 0;

        public event Action<SacredCovenant, int> OnCovenantChanged;

        public void JoinCovenant(SacredCovenant covenant)
        {
            ActiveCovenant = covenant;
            CovenantRank = Mathf.Max(1, CovenantRank);
            OnCovenantChanged?.Invoke(ActiveCovenant, CovenantRank);
        }

        public float GetAttackBonusMultiplier() => ActiveCovenant switch
        {
            SacredCovenant.WarriorsOfSunlight => 1.15f,
            SacredCovenant.Darkwraiths => 1.18f,
            SacredCovenant.ChaosServant => 1.12f,
            _ => 1.0f
        };

        public float GetDefenseBonusMultiplier() => ActiveCovenant switch
        {
            SacredCovenant.ForestHunters => 0.88f,
            SacredCovenant.BladeOfTheDarkmoon => 0.90f,
            SacredCovenant.GravelordServant => 0.85f,
            _ => 1.0f
        };
    }
}
