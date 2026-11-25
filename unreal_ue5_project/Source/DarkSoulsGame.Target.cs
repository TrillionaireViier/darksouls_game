// Copyright Dark Souls Game Project. All Rights Reserved. UE 5.8

using UnrealBuildTool;
using System.Collections.Generic;

public class DarkSoulsGameTarget : TargetRules
{
	public DarkSoulsGameTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Game;
		DefaultBuildSettings = BuildSettingsVersion.V5;
		IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
		ExtraModuleNames.Add("DarkSoulsGame");
	}
}
