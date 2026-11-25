// Copyright Dark Souls Game Project. All Rights Reserved. UE 5.8

using UnrealBuildTool;
using System.Collections.Generic;

public class DarkSoulsGameEditorTarget : TargetRules
{
	public DarkSoulsGameEditorTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Editor;
		DefaultBuildSettings = BuildSettingsVersion.V5;
		IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
		ExtraModuleNames.Add("DarkSoulsGame");
	}
}
